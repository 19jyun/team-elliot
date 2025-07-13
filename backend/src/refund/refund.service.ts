import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ClassSessionService } from '../class-session/class-session.service';
import { RefundRequestDto, RefundReason } from './dto/refund-request.dto';
import { RefundProcessDto, RefundStatus } from './dto/refund-process.dto';
import {
  ACTIVITY_TYPES,
  ENTITY_TYPES,
} from '../activity-log/constants/activity-types';

@Injectable()
export class RefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly classSessionService: ClassSessionService,
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

    // 환불 요청 생성
    const refundRequest = await this.prisma.refundRequest.create({
      data: {
        sessionEnrollmentId: dto.sessionEnrollmentId,
        studentId: studentId,
        reason: dto.reason,
        detailedReason: dto.detailedReason,
        refundAmount: dto.refundAmount,
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
    });

    // 환불 요청 로그
    await this.activityLogService.logActivityAsync({
      userId: studentId,
      userRole: 'STUDENT',
      action: ACTIVITY_TYPES.PAYMENT.REFUND_REQUEST,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: dto.sessionEnrollmentId,
      oldValue: {
        sessionId: sessionEnrollment.sessionId,
        className: sessionEnrollment.session.class.className,
        sessionDate: sessionEnrollment.session.date,
        status: sessionEnrollment.status,
      },
      newValue: {
        refundRequestId: refundRequest.id,
        sessionId: sessionEnrollment.sessionId,
        className: sessionEnrollment.session.class.className,
        sessionDate: sessionEnrollment.session.date,
        reason: dto.reason,
        refundAmount: dto.refundAmount,
        status: 'PENDING',
      },
      description: `${sessionEnrollment.session.class.className} 환불 요청: ${dto.refundAmount.toLocaleString()}원`,
    });

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

    // 환불 요청 취소 로그
    await this.activityLogService.logActivityAsync({
      userId: studentId,
      userRole: 'STUDENT',
      action: ACTIVITY_TYPES.PAYMENT.REFUND_REQUEST,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: refundRequest.sessionEnrollmentId,
      oldValue: {
        refundRequestId: refundRequest.id,
        sessionId: refundRequest.sessionEnrollment.sessionId,
        className: refundRequest.sessionEnrollment.session.class.className,
        sessionDate: refundRequest.sessionEnrollment.session.date,
        status: 'PENDING',
      },
      newValue: {
        refundRequestId: refundRequest.id,
        sessionId: refundRequest.sessionEnrollment.sessionId,
        className: refundRequest.sessionEnrollment.session.class.className,
        sessionDate: refundRequest.sessionEnrollment.session.date,
        status: 'CANCELLED',
        cancelledAt: cancelledRefundRequest.cancelledAt,
      },
      description: `${refundRequest.sessionEnrollment.session.class.className} 환불 요청 취소`,
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

      // SessionEnrollment 상태를 CANCELLED로 변경
      await this.prisma.sessionEnrollment.update({
        where: { id: refundRequest.sessionEnrollmentId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      // 세션의 currentStudents 감소
      await this.classSessionService.decrementSessionCurrentStudents(
        refundRequest.sessionEnrollment.sessionId,
      );
    }

    // 환불 처리 로그
    const action =
      dto.status === 'APPROVED'
        ? ACTIVITY_TYPES.PAYMENT.REFUND_COMPLETED
        : dto.status === 'REJECTED'
          ? ACTIVITY_TYPES.PAYMENT.REFUND_REJECTED
          : ACTIVITY_TYPES.PAYMENT.PARTIAL_REFUND;

    await this.activityLogService.logActivityAsync({
      userId: processorId,
      userRole: 'ADMIN', // 또는 'TEACHER'
      action: action,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: refundRequest.sessionEnrollmentId,
      oldValue: {
        refundRequestId: refundRequest.id,
        sessionId: refundRequest.sessionEnrollment.sessionId,
        className: refundRequest.sessionEnrollment.session.class.className,
        sessionDate: refundRequest.sessionEnrollment.session.date,
        status: 'PENDING',
        refundAmount: refundRequest.refundAmount,
      },
      newValue: {
        refundRequestId: refundRequest.id,
        sessionId: refundRequest.sessionEnrollment.sessionId,
        className: refundRequest.sessionEnrollment.session.class.className,
        sessionDate: refundRequest.sessionEnrollment.session.date,
        status: dto.status,
        refundAmount: refundRequest.refundAmount,
        actualRefundAmount: processedRefundRequest.actualRefundAmount,
        processReason: dto.processReason,
        processedAt: processedRefundRequest.processedAt,
      },
      description: `${refundRequest.sessionEnrollment.session.class.className} 환불 ${dto.status === 'APPROVED' ? '승인' : dto.status === 'REJECTED' ? '거부' : '부분 승인'}: ${processedRefundRequest.actualRefundAmount?.toLocaleString()}원`,
    });

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
        processor: true,
      },
    });

    if (!refundRequest) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    return refundRequest;
  }
}
