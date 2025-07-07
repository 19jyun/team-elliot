import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_TYPES, ENTITY_TYPES } from './constants/activity-types';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';

@Injectable()
export class ActivityLogQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 수강 신청 내역 조회
   */
  async getEnrollmentHistory(userId: number, query: QueryActivityLogDto) {
    const enrollmentActions = [
      ACTIVITY_TYPES.ENROLLMENT.ENROLL_SESSION,
      ACTIVITY_TYPES.ENROLLMENT.BATCH_ENROLL_SESSIONS,
      ACTIVITY_TYPES.ENROLLMENT.CANCEL_ENROLLMENT,
      ACTIVITY_TYPES.ENROLLMENT.CHANGE_SCHEDULE,
      ACTIVITY_TYPES.ENROLLMENT.APPROVE_ENROLLMENT,
      ACTIVITY_TYPES.ENROLLMENT.REJECT_ENROLLMENT,
    ];

    return this.getActivityHistory(userId, {
      ...query,
      actions: enrollmentActions,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
    });
  }

  /**
   * 결제 내역 조회
   */
  async getPaymentHistory(userId: number, query: QueryActivityLogDto) {
    const paymentActions = [
      ACTIVITY_TYPES.PAYMENT.PAYMENT_ATTEMPT,
      ACTIVITY_TYPES.PAYMENT.PAYMENT_COMPLETED,
      ACTIVITY_TYPES.PAYMENT.PAYMENT_FAILED,
      ACTIVITY_TYPES.PAYMENT.PAYMENT_CANCELLED,
    ];

    return this.getActivityHistory(userId, {
      ...query,
      actions: paymentActions,
      entityType: ENTITY_TYPES.PAYMENT,
    });
  }

  /**
   * 환불/취소 내역 조회
   */
  async getRefundCancellationHistory(
    userId: number,
    query: QueryActivityLogDto,
  ) {
    const refundActions = [
      ACTIVITY_TYPES.PAYMENT.REFUND_REQUEST,
      ACTIVITY_TYPES.PAYMENT.REFUND_COMPLETED,
      ACTIVITY_TYPES.PAYMENT.REFUND_REJECTED,
      ACTIVITY_TYPES.PAYMENT.PARTIAL_REFUND,
      ACTIVITY_TYPES.ENROLLMENT.CANCEL_ENROLLMENT,
      ACTIVITY_TYPES.PAYMENT.PAYMENT_CANCELLED,
    ];

    return this.getActivityHistory(userId, {
      ...query,
      actions: refundActions,
    });
  }

  /**
   * 출석 내역 조회
   */
  async getAttendanceHistory(userId: number, query: QueryActivityLogDto) {
    const attendanceActions = [
      ACTIVITY_TYPES.ATTENDANCE.ATTENDANCE_CHECK,
      ACTIVITY_TYPES.ATTENDANCE.ATTENDANCE_UPDATE,
      ACTIVITY_TYPES.ATTENDANCE.LATE_ATTENDANCE,
      ACTIVITY_TYPES.ATTENDANCE.ABSENT_ATTENDANCE,
    ];

    return this.getActivityHistory(userId, {
      ...query,
      actions: attendanceActions,
      entityType: ENTITY_TYPES.ATTENDANCE,
    });
  }

  /**
   * 통합 활동 히스토리 조회 (카테고리별)
   */
  async getActivityHistoryByCategory(
    userId: number,
    category: string,
    query: QueryActivityLogDto,
  ) {
    const categoryActions = ACTIVITY_TYPES[category.toUpperCase()];
    if (!categoryActions) {
      throw new Error(`Invalid category: ${category}`);
    }

    return this.getActivityHistory(userId, {
      ...query,
      actions: Object.values(categoryActions),
    });
  }

  /**
   * 특정 세션의 전체 활동 히스토리 조회
   */
  async getSessionActivityHistory(
    sessionId: number,
    query: QueryActivityLogDto,
  ) {
    const { page = 1, limit = 20, startDate, endDate, action, level } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: sessionId,
      ...(action && { action }),
      ...(level && { level }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 통계 정보 조회
   */
  async getActivityStatistics(
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      userId,
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    // 카테고리별 통계
    const categoryStats = await this.prisma.activityLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true,
      },
    });

    // 상태별 통계 (결제, 환불 등)
    const statusStats = await this.prisma.activityLog.groupBy({
      by: ['level'],
      where,
      _count: {
        level: true,
      },
    });

    // 월별 통계
    const monthlyStats = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        action
      FROM activity_logs 
      WHERE "user_id" = ${userId}
      ${startDate && endDate ? `AND "createdAt" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : ''}
      GROUP BY DATE_TRUNC('month', "createdAt"), action
      ORDER BY month DESC, count DESC
    `;

    return {
      categoryStats,
      statusStats,
      monthlyStats,
    };
  }

  /**
   * 관리자용 통합 대시보드 데이터
   */
  async getAdminDashboardData(query: QueryActivityLogDto) {
    const { startDate, endDate, userRole } = query;
    const where: any = {
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(userRole && { userRole }),
    };

    // 전체 활동 통계
    const totalActivities = await this.prisma.activityLog.count({ where });

    // 사용자별 활동 통계
    const userStats = await this.prisma.activityLog.groupBy({
      by: ['userId', 'userRole'],
      where,
      _count: {
        userId: true,
      },
    });

    // 활동 타입별 통계
    const actionStats = await this.prisma.activityLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true,
      },
    });

    // 최근 활동 (최근 10개)
    const recentActivities = await this.prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalActivities,
      userStats,
      actionStats,
      recentActivities,
    };
  }

  /**
   * 내부 헬퍼 메서드: 활동 히스토리 조회
   */
  async getActivityHistory(
    userId: number,
    options: {
      actions?: string[];
      entityType?: string;
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      action?: string;
      level?: string;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      action,
      level,
      actions,
      entityType,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...(actions && actions.length > 0 && { action: { in: actions } }),
      ...(entityType && { entityType }),
      ...(action && { action }),
      ...(level && { level }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
