import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassSessionService } from '../class-session/class-session.service';
import { SocketGateway } from '../socket/socket.gateway';
import { RefundRequestDto } from './dto/refund-request.dto';
import { RefundProcessDto } from './dto/refund-process.dto';

@Injectable()
export class RefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classSessionService: ClassSessionService,
    private readonly socketGateway: SocketGateway,
  ) {}

  /**
   * userId로 Student 조회
   */
  async findStudentByUserId(userId: string) {
    // User 테이블에서 먼저 찾기
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
        details: { userId },
      });
    }

    // Student 정보 찾기
    const student = await this.prisma.student.findUnique({
      where: { userRefId: user.id },
    });

    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: 'Student를 찾을 수 없습니다.',
        details: { userRefId: user.id },
      });
    }

    return student;
  }

  /**
   * 환불 요청 생성
   */
  async createRefundRequest(dto: RefundRequestDto, studentId: number) {
    // 세션 수강 신청 정보 조회
    const sessionEnrollment = await this.prisma.sessionEnrollment.findUnique({
      where: { id: dto.sessionEnrollmentId },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
        payment: true,
      },
    });

    if (!sessionEnrollment) {
      throw new NotFoundException({
        code: 'SESSION_ENROLLMENT_NOT_FOUND',
        message: '세션 수강 신청을 찾을 수 없습니다.',
        details: { sessionEnrollmentId: dto.sessionEnrollmentId },
      });
    }

    // 권한 확인 (자신의 수강 신청만 환불 요청 가능)
    if (sessionEnrollment.studentId !== studentId) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '자신의 수강 신청만 환불 요청할 수 있습니다.',
        details: {
          studentId,
          enrollmentStudentId: sessionEnrollment.studentId,
          sessionEnrollmentId: dto.sessionEnrollmentId,
        },
      });
    }

    // 이미 환불 요청이 있는지 확인
    const existingRefundRequest = await this.prisma.refundRequest.findFirst({
      where: {
        sessionEnrollmentId: dto.sessionEnrollmentId,
        status: {
          in: ['PENDING', 'APPROVED', 'PARTIAL_APPROVED'],
        },
      },
    });

    if (existingRefundRequest) {
      throw new ConflictException({
        code: 'REFUND_REQUEST_ALREADY_EXISTS',
        message: '이미 환불 요청이 진행 중입니다.',
        details: {
          sessionEnrollmentId: dto.sessionEnrollmentId,
          existingRefundRequestId: existingRefundRequest.id,
          existingStatus: existingRefundRequest.status,
        },
      });
    }

    // 수업이 이미 시작되었는지 확인
    const now = new Date();
    const sessionStartTime = new Date(sessionEnrollment.session.startTime);
    if (now >= sessionStartTime) {
      throw new BadRequestException({
        code: 'SESSION_ALREADY_STARTED',
        message: '수업이 이미 시작되어 환불 요청할 수 없습니다.',
        details: {
          sessionStartTime: sessionStartTime.toISOString(),
          currentTime: now.toISOString(),
          sessionEnrollmentId: dto.sessionEnrollmentId,
        },
      });
    }

    // 환불 요청 생성과 동시에 enrollment status를 REFUND_REQUESTED로 변경
    const [refundRequest, updatedEnrollment] = await this.prisma.$transaction([
      // 환불 요청 생성
      this.prisma.refundRequest.create({
        data: {
          sessionEnrollmentId: dto.sessionEnrollmentId,
          studentId: studentId,
          reason: dto.reason,
          detailedReason: dto.detailedReason,
          refundAmount: dto.refundAmount,
          bankName: dto.bankName,
          accountNumber: dto.accountNumber,
          accountHolder: dto.accountHolder,
          status: 'PENDING',
        },
        include: {
          sessionEnrollment: {
            include: {
              session: {
                include: {
                  class: {
                    include: {
                      teacher: true,
                    },
                  },
                },
              },
            },
          },
          student: true,
        },
      }),
      // enrollment status를 REFUND_REQUESTED로 변경
      this.prisma.sessionEnrollment.update({
        where: { id: dto.sessionEnrollmentId },
        data: {
          status: 'REFUND_REQUESTED',
          cancelledAt: new Date(),
        },
      }),
    ]);

    console.log('환불 요청 생성 완료:', {
      refundRequestId: refundRequest.id,
      enrollmentId: updatedEnrollment.id,
      enrollmentStatus: updatedEnrollment.status,
    });

    // Socket 이벤트 발생 - 새로운 환불 요청 알림
    this.socketGateway.notifyNewRefundRequest(
      refundRequest.id,
      refundRequest.studentId,
      refundRequest.sessionEnrollment.sessionId,
      refundRequest.sessionEnrollment.session.class.academyId,
    );

    return refundRequest;
  }

  /**
   * 환불 요청 취소
   */
  async cancelRefundRequest(refundRequestId: number, studentId: number) {
    const refundRequest = await this.prisma.refundRequest.findUnique({
      where: { id: refundRequestId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: true,
              },
            },
          },
        },
        student: true,
      },
    });

    if (!refundRequest) {
      throw new NotFoundException({
        code: 'REFUND_REQUEST_NOT_FOUND',
        message: '환불 요청을 찾을 수 없습니다.',
        details: { refundRequestId },
      });
    }

    // 권한 확인
    if (refundRequest.studentId !== studentId) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '자신의 환불 요청만 취소할 수 있습니다.',
        details: {
          studentId,
          refundRequestStudentId: refundRequest.studentId,
          refundRequestId,
        },
      });
    }

    // 상태 확인 (대기 중인 요청만 취소 가능)
    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException({
        code: 'REFUND_REQUEST_NOT_PENDING',
        message: '대기 중인 환불 요청만 취소할 수 있습니다.',
        details: {
          refundRequestId,
          currentStatus: refundRequest.status,
          requiredStatus: 'PENDING',
        },
      });
    }

    // 환불 요청 취소
    const cancelledRefundRequest = await this.prisma.refundRequest.update({
      where: { id: refundRequestId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return cancelledRefundRequest;
  }

  /**
   * 환불 요청 처리 (관리자/강사용)
   */
  async processRefundRequest(dto: RefundProcessDto, processorId: number) {
    const refundRequest = await this.prisma.refundRequest.findUnique({
      where: { id: dto.refundRequestId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
      },
    });

    if (!refundRequest) {
      throw new NotFoundException({
        code: 'REFUND_REQUEST_NOT_FOUND',
        message: '환불 요청을 찾을 수 없습니다.',
        details: { refundRequestId: dto.refundRequestId },
      });
    }

    // 상태 확인 (대기 중인 요청만 처리 가능)
    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException({
        code: 'REFUND_REQUEST_NOT_PENDING',
        message: '대기 중인 환불 요청만 처리할 수 있습니다.',
        details: {
          refundRequestId: dto.refundRequestId,
          currentStatus: refundRequest.status,
          requiredStatus: 'PENDING',
        },
      });
    }

    // 환불 요청 처리
    const processedRefundRequest = await this.prisma.refundRequest.update({
      where: { id: dto.refundRequestId },
      data: {
        status: dto.status,
        processReason: dto.processReason,
        actualRefundAmount:
          dto.actualRefundAmount || refundRequest.refundAmount,
        processedBy: processorId,
        processedAt: new Date(),
      },
    });

    // 결제 상태 업데이트 (환불 완료 시)
    if (dto.status === 'APPROVED' || dto.status === 'PARTIAL_APPROVED') {
      await this.prisma.payment.update({
        where: { sessionEnrollmentId: refundRequest.sessionEnrollmentId },
        data: {
          status: 'REFUNDED',
        },
      });

      // SessionEnrollment 상태를 REFUND_CANCELLED로 변경
      await this.prisma.sessionEnrollment.update({
        where: { id: refundRequest.sessionEnrollmentId },
        data: {
          status: 'REFUND_CANCELLED',
          cancelledAt: new Date(),
        },
      });

      // 세션의 currentStudents 감소 (상태 변경에 따른 자동 처리)
      await this.classSessionService.updateSessionCurrentStudents(
        refundRequest.sessionEnrollment.sessionId,
        'CONFIRMED',
        'REFUND_CANCELLED',
        refundRequest.sessionEnrollmentId,
      );
    }

    // Socket 이벤트 발생 - 환불 요청 승인 알림
    if (dto.status === 'APPROVED' || dto.status === 'PARTIAL_APPROVED') {
      this.socketGateway.notifyRefundAccepted(
        processedRefundRequest.id,
        processedRefundRequest.studentId,
      );
    }

    return processedRefundRequest;
  }

  /**
   * 학생별 환불 요청 목록 조회
   */
  async getStudentRefundRequests(studentId: number) {
    return this.prisma.refundRequest.findMany({
      where: { studentId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
        processor: true,
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * 전체 환불 요청 목록 조회 (관리자/강사용)
   */
  async getAllRefundRequests(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.refundRequest.findMany({
      where,
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
        processor: true,
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * 환불 요청 상세 조회
   */
  async getRefundRequest(refundRequestId: number) {
    const refundRequest = await this.prisma.refundRequest.findUnique({
      where: { id: refundRequestId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
        processor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!refundRequest) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    return refundRequest;
  }

  /**
   * 환불 요청 승인
   */
  async approveRefundRequest(refundRequestId: number, processorId: number) {
    // 환불 요청 정보 조회
    const refundRequest = await this.prisma.refundRequest.findUnique({
      where: { id: refundRequestId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
      },
    });

    if (!refundRequest) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    // 권한 확인 (해당 클래스의 선생님이거나 관리자만 승인 가능)
    if (
      refundRequest.sessionEnrollment.session.class.teacherId !== processorId
    ) {
      // TODO: 관리자 권한 확인 로직 추가
      throw new ForbiddenException('해당 환불 요청을 승인할 권한이 없습니다.');
    }

    // 상태 확인
    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException(
        '대기 중인 환불 요청만 승인할 수 있습니다.',
      );
    }

    // 트랜잭션으로 환불 요청 승인 및 세션 상태 변경
    const result = await this.prisma.$transaction(async (prisma) => {
      // 환불 요청 승인
      const updatedRefundRequest = await prisma.refundRequest.update({
        where: { id: refundRequestId },
        data: {
          status: 'APPROVED',
          processedBy: processorId,
          processedAt: new Date(),
          actualRefundAmount: refundRequest.refundAmount,
        },
        include: {
          sessionEnrollment: {
            include: {
              session: {
                include: {
                  class: true,
                },
              },
            },
          },
          student: true,
        },
      });

      // 세션 enrollment 상태를 REFUND_CANCELLED로 변경
      await prisma.sessionEnrollment.update({
        where: { id: refundRequest.sessionEnrollmentId },
        data: {
          status: 'REFUND_CANCELLED',
          cancelledAt: new Date(),
        },
      });

      return updatedRefundRequest;
    });

    // 세션 현재 학생 수 감소 (상태 변경에 따른 자동 처리)
    await this.classSessionService.updateSessionCurrentStudents(
      refundRequest.sessionEnrollment.sessionId,
      'CONFIRMED',
      'REFUND_CANCELLED',
    );

    return result;
  }

  /**
   * 환불 요청 거절
   */
  async rejectRefundRequest(
    refundRequestId: number,
    data: { reason: string; detailedReason?: string },
    processorId: number,
  ) {
    // 환불 요청 정보 조회
    const refundRequest = await this.prisma.refundRequest.findUnique({
      where: { id: refundRequestId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
      },
    });

    if (!refundRequest) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    // 권한 확인 (해당 클래스의 선생님이거나 관리자만 거절 가능)
    if (
      refundRequest.sessionEnrollment.session.class.teacherId !== processorId
    ) {
      // TODO: 관리자 권한 확인 로직 추가
      throw new ForbiddenException('해당 환불 요청을 거절할 권한이 없습니다.');
    }

    // 상태 확인
    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException(
        '대기 중인 환불 요청만 거절할 수 있습니다.',
      );
    }

    // 트랜잭션으로 환불 요청 거절, 세션 상태 복원, 거절 상세 정보 생성
    const result = await this.prisma.$transaction(async (prisma) => {
      // 환불 요청 거절
      const updatedRefundRequest = await prisma.refundRequest.update({
        where: { id: refundRequestId },
        data: {
          status: 'REJECTED',
          processedBy: processorId,
          processedAt: new Date(),
          processReason: data.reason,
        },
        include: {
          sessionEnrollment: {
            include: {
              session: {
                include: {
                  class: true,
                },
              },
            },
          },
          student: true,
        },
      });

      // 세션 enrollment 상태를 REFUND_REJECTED_CONFIRMED로 변경
      await prisma.sessionEnrollment.update({
        where: { id: refundRequest.sessionEnrollmentId },
        data: {
          status: 'REFUND_REJECTED_CONFIRMED',
          cancelledAt: null,
        },
      });

      // 거절 상세 정보 생성
      await prisma.rejectionDetail.create({
        data: {
          rejectionType: 'REFUND_REJECTION',
          entityId: refundRequestId,
          entityType: 'RefundRequest',
          reason: data.reason,
          detailedReason: data.detailedReason,
          rejectedBy: processorId,
        },
      });

      return updatedRefundRequest;
    });

    // 세션 현재 학생 수 증가 (환불 거절로 수강 상태 복원)
    await this.classSessionService.updateSessionCurrentStudents(
      refundRequest.sessionEnrollment.sessionId,
      'REFUND_REQUESTED',
      'REFUND_REJECTED_CONFIRMED',
      refundRequest.sessionEnrollmentId,
    );

    // Socket 이벤트 발생 - 환불 요청 거절 알림
    this.socketGateway.notifyRefundRejected(result.id, result.studentId);

    return result;
  }

  // Principal의 학원 모든 환불요청 조회
  async getPrincipalRefundRequests(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    const refundRequests = await this.prisma.refundRequest.findMany({
      where: {
        sessionEnrollment: {
          session: {
            class: {
              academyId: principal.academyId,
            },
          },
        },
      },
      include: {
        sessionEnrollment: {
          include: {
            student: {
              select: {
                name: true,
                phoneNumber: true,
              },
            },
            session: {
              include: {
                class: {
                  select: {
                    id: true,
                    className: true,
                    teacher: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        processor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return refundRequests;
  }

  // Principal의 환불 요청 대기 세션 목록 조회
  async getPrincipalSessionsWithRefundRequests(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    const sessions = await this.prisma.classSession.findMany({
      where: {
        class: {
          academyId: principal.academyId,
        },
        enrollments: {
          some: {
            status: 'REFUND_REQUESTED',
            refundRequests: {
              some: {
                status: 'PENDING',
              },
            },
          },
        },
      },
      include: {
        class: {
          select: {
            id: true,
            className: true,
            level: true,
          },
        },
        enrollments: {
          where: {
            status: 'REFUND_REQUESTED',
            refundRequests: {
              some: {
                status: 'PENDING',
              },
            },
          },
          include: {
            refundRequests: {
              where: {
                status: 'PENDING',
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      className: session.class.className,
      sessionDate: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      requestCount: session.enrollments.reduce(
        (total, enrollment) => total + enrollment.refundRequests.length,
        0,
      ),
      class: {
        level: session.class.level,
      },
    }));
  }

  // Principal의 특정 세션 환불 요청 목록 조회
  async getPrincipalSessionRefundRequests(sessionId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 세션이 Principal의 학원에 속하는지 확인
    const session = await this.prisma.classSession.findFirst({
      where: {
        id: sessionId,
        class: {
          academyId: principal.academyId,
        },
      },
    });

    if (!session) {
      throw new ForbiddenException('해당 세션에 접근할 권한이 없습니다.');
    }

    const refundRequests = await this.prisma.refundRequest.findMany({
      where: {
        sessionEnrollment: {
          sessionId,
          status: 'REFUND_REQUESTED',
        },
        status: 'PENDING',
      },
      include: {
        sessionEnrollment: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
            session: {
              include: {
                class: {
                  select: {
                    id: true,
                    className: true,
                    level: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        requestedAt: 'asc',
      },
    });

    return refundRequests;
  }

  // Principal이 환불 요청 승인
  async approveRefundByPrincipal(refundId: number, userId: number) {
    // userId는 User 테이블의 ID이므로, Principal 정보를 userRefId로 찾음
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 환불 요청이 Principal의 학원에 속하는지 확인
    const refundRequest = await this.prisma.refundRequest.findFirst({
      where: {
        id: refundId,
        sessionEnrollment: {
          session: {
            class: {
              academyId: principal.academyId,
            },
          },
        },
      },
    });

    if (!refundRequest) {
      throw new ForbiddenException('해당 환불 요청에 접근할 권한이 없습니다.');
    }

    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 환불 요청입니다.');
    }

    // Principal 정보를 User 테이블에서 찾거나 생성 (processedBy 기록용)
    let processedByUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!processedByUser) {
      processedByUser = await this.prisma.user.create({
        data: {
          userId: principal.userId,
          password: principal.password,
          name: principal.name,
          role: 'PRINCIPAL',
        },
      });
    }

    // 트랜잭션으로 환불 승인 + 결제/수강신청 상태 변경
    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedRefundRequest = await prisma.refundRequest.update({
        where: { id: refundId },
        data: {
          status: 'APPROVED',
          processedBy: processedByUser.id,
          processedAt: new Date(),
          actualRefundAmount: refundRequest.refundAmount,
        },
        include: {
          sessionEnrollment: {
            include: {
              student: true,
              session: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      });

      // 결제 상태 업데이트 (존재 시)
      await prisma.payment
        .update({
          where: { sessionEnrollmentId: refundRequest.sessionEnrollmentId },
          data: { status: 'REFUNDED' },
        })
        .catch(() => undefined);

      // 수강신청 상태를 REFUND_CANCELLED로 변경
      const updatedEnrollment = await prisma.sessionEnrollment.update({
        where: { id: refundRequest.sessionEnrollmentId },
        data: {
          status: 'REFUND_CANCELLED',
          cancelledAt: new Date(),
        },
        include: {
          session: true,
        },
      });

      return { updatedRefundRequest, updatedEnrollment };
    });

    // 세션 현재 인원 감소 (CONFIRMED -> REFUND_CANCELLED)
    await this.classSessionService.updateSessionCurrentStudents(
      result.updatedEnrollment.sessionId,
      'CONFIRMED',
      'REFUND_CANCELLED',
      result.updatedEnrollment.id,
    );

    // 소켓 알림: 환불 요청 승인
    try {
      this.socketGateway.notifyRefundAccepted(
        result.updatedRefundRequest.id,
        result.updatedRefundRequest.sessionEnrollment.studentId,
      );
    } catch (e) {
      console.warn('Socket notifyRefundAccepted failed:', e);
    }

    return result.updatedRefundRequest;
  }

  // Principal이 환불 요청 거절
  async rejectRefundByPrincipal(
    refundId: number,
    rejectData: { reason: string; detailedReason?: string },
    userId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 환불 요청이 Principal의 학원에 속하는지 확인
    const refundRequest = await this.prisma.refundRequest.findFirst({
      where: {
        id: refundId,
        sessionEnrollment: {
          session: {
            class: {
              academyId: principal.academyId,
            },
          },
        },
      },
    });

    if (!refundRequest) {
      throw new ForbiddenException('해당 환불 요청에 접근할 권한이 없습니다.');
    }

    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 환불 요청입니다.');
    }

    // Principal 정보를 User 테이블에서 찾거나 생성
    let user = await this.prisma.user.findUnique({
      where: { userId: principal.userId },
    });

    if (!user) {
      // Principal 정보를 User 테이블에 추가
      user = await this.prisma.user.create({
        data: {
          userId: principal.userId,
          password: principal.password,
          name: principal.name,
          role: 'PRINCIPAL',
        },
      });
    }

    // 트랜잭션으로 환불 요청 거절 + 수강신청 상태 복원 + 거절 상세 정보 생성
    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedRefundRequest = await prisma.refundRequest.update({
        where: { id: refundId },
        data: {
          status: 'REJECTED',
        },
        include: {
          sessionEnrollment: {
            include: {
              student: true,
              session: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      });

      // 수강신청 상태를 REFUND_REJECTED_CONFIRMED로 변경 (환불 거절로 수강 지속)
      const updatedEnrollment = await prisma.sessionEnrollment.update({
        where: { id: refundRequest.sessionEnrollmentId },
        data: {
          status: 'REFUND_REJECTED_CONFIRMED',
          cancelledAt: null,
        },
        include: { session: true },
      });

      // 거절 상세 정보 생성
      await prisma.rejectionDetail.create({
        data: {
          rejectionType: 'REFUND_REJECTION',
          entityId: refundId,
          entityType: 'RefundRequest',
          reason: rejectData.reason,
          detailedReason: rejectData.detailedReason,
          rejectedBy: user.id,
        },
      });

      return { updatedRefundRequest, updatedEnrollment };
    });

    // currentStudents 조정: 기존 구현 정책상 REFUND_REQUESTED에서 기여 플래그는 유지되므로 증감 없음
    // 그래도 상태 이력 일관성을 위해 헬퍼 호출 (내부 hasContributed 기반으로 변화 없으면 no-op)
    await this.classSessionService.updateSessionCurrentStudents(
      result.updatedEnrollment.sessionId,
      'REFUND_REQUESTED',
      'REFUND_REJECTED_CONFIRMED',
      result.updatedEnrollment.id,
    );

    // 소켓 알림: 환불 요청 거절
    try {
      this.socketGateway.notifyRefundRejected(
        result.updatedRefundRequest.id,
        result.updatedRefundRequest.sessionEnrollment.studentId,
      );
    } catch (e) {
      console.warn('Socket notifyRefundRejected failed:', e);
    }

    return result.updatedRefundRequest;
  }
}
