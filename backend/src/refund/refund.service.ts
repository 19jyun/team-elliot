import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassSessionService } from '../class-session/class-session.service';
import { SocketGateway } from '../socket/socket.gateway';
import { RefundRequestDto, RefundReason } from './dto/refund-request.dto';
import { RefundProcessDto, RefundStatus } from './dto/refund-process.dto';

@Injectable()
export class RefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classSessionService: ClassSessionService,
    private readonly socketGateway: SocketGateway,
  ) {}

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
      throw new NotFoundException('세션 수강 신청을 찾을 수 없습니다.');
    }

    // 권한 확인 (자신의 수강 신청만 환불 요청 가능)
    if (sessionEnrollment.studentId !== studentId) {
      throw new ForbiddenException(
        '자신의 수강 신청만 환불 요청할 수 있습니다.',
      );
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
      throw new BadRequestException('이미 환불 요청이 진행 중입니다.');
    }

    // 수업이 이미 시작되었는지 확인
    const now = new Date();
    const sessionStartTime = new Date(sessionEnrollment.session.startTime);
    if (now >= sessionStartTime) {
      throw new BadRequestException(
        '수업이 이미 시작되어 환불 요청할 수 없습니다.',
      );
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
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    // 권한 확인
    if (refundRequest.studentId !== studentId) {
      throw new ForbiddenException('자신의 환불 요청만 취소할 수 있습니다.');
    }

    // 상태 확인 (대기 중인 요청만 취소 가능)
    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException(
        '대기 중인 환불 요청만 취소할 수 있습니다.',
      );
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
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    // 상태 확인 (대기 중인 요청만 처리 가능)
    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException(
        '대기 중인 환불 요청만 처리할 수 있습니다.',
      );
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
}
