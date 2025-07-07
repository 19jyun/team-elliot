import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityLogDto, LogLevel } from './dto/create-activity-log.dto';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';

// 중요 활동 정의 (CRITICAL 레벨)
const CRITICAL_ACTIONS = [
  'ENROLL_SESSION',
  'CANCEL_ENROLLMENT',
  'PAYMENT_COMPLETED',
  'PAYMENT_FAILED',
  'PAYMENT_REFUNDED',
  'ACCOUNT_DELETION',
  'ROLE_CHANGE',
  'SYSTEM_CONFIG_CHANGE',
];

// 중요 활동 정의 (IMPORTANT 레벨)
const IMPORTANT_ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'PROFILE_UPDATE',
  'PASSWORD_CHANGE',
  'ATTENDANCE_CHECK',
  'ATTENDANCE_UPDATE',
  'CLASS_CREATE',
  'CLASS_UPDATE',
  'CLASS_DELETE',
  'NOTICE_CREATE',
  'NOTICE_UPDATE',
  'NOTICE_DELETE',
  'ACADEMY_JOIN',
  'ACADEMY_LEAVE',
];

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);
  private logQueue: CreateActivityLogDto[] = [];
  private batchSize = 50;
  private flushInterval = 5000; // 5초
  private isFlushing = false;

  constructor(private readonly prisma: PrismaService) {
    // 배치 로깅을 위한 주기적 플러시
    setInterval(() => this.flushLogs(), this.flushInterval);

    // 애플리케이션 종료 시 남은 로그 플러시
    process.on('beforeExit', () => this.flushLogs());
  }

  /**
   * 활동 로그를 비동기로 기록 (성능 최적화)
   */
  async logActivityAsync(data: CreateActivityLogDto): Promise<void> {
    try {
      // 로그 레벨 자동 설정
      const level = this.determineLogLevel(data.action);

      // 로그 레벨에 따른 필터링
      if (!this.shouldLog(level)) {
        return;
      }

      const logData = {
        ...data,
        level,
        oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
        newValue: data.newValue ? JSON.stringify(data.newValue) : null,
      };

      this.logQueue.push(logData);

      // 배치 크기에 도달하면 즉시 플러시
      if (this.logQueue.length >= this.batchSize) {
        await this.flushLogs();
      }
    } catch (error) {
      this.logger.error('Failed to queue activity log', error);
    }
  }

  /**
   * 활동 로그를 즉시 기록 (중요한 활동용)
   */
  async logActivitySync(data: CreateActivityLogDto) {
    try {
      const level = this.determineLogLevel(data.action);

      if (!this.shouldLog(level)) {
        return;
      }

      return await this.prisma.activityLog.create({
        data: {
          ...data,
          level,
          oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
          newValue: data.newValue ? JSON.stringify(data.newValue) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to log activity synchronously', error);
      throw error;
    }
  }

  /**
   * 배치 로그 플러시
   */
  private async flushLogs(): Promise<void> {
    if (this.isFlushing || this.logQueue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const logs = this.logQueue.splice(0);

    try {
      await this.prisma.activityLog.createMany({
        data: logs,
      });

      this.logger.debug(`Flushed ${logs.length} activity logs`);
    } catch (error) {
      this.logger.error('Failed to flush activity logs', error);
      // 실패한 로그를 다시 큐에 추가
      this.logQueue.unshift(...logs);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * 로그 레벨 자동 결정
   */
  private determineLogLevel(action: string): LogLevel {
    if (CRITICAL_ACTIONS.includes(action)) {
      return LogLevel.CRITICAL;
    }
    if (IMPORTANT_ACTIONS.includes(action)) {
      return LogLevel.IMPORTANT;
    }
    return LogLevel.NORMAL;
  }

  /**
   * 로그 레벨에 따른 필터링
   */
  private shouldLog(level: LogLevel): boolean {
    const currentLogLevel = process.env.LOG_LEVEL || 'IMPORTANT';

    const levelPriority = {
      [LogLevel.CRITICAL]: 4,
      [LogLevel.IMPORTANT]: 3,
      [LogLevel.NORMAL]: 2,
      [LogLevel.DEBUG]: 1,
    };

    const currentPriority = levelPriority[currentLogLevel as LogLevel] || 3;
    const logPriority = levelPriority[level];

    return logPriority >= currentPriority;
  }

  /**
   * 사용자별 활동 히스토리 조회
   */
  async getUserHistory(userId: number, query: QueryActivityLogDto) {
    const { page = 1, limit = 20, startDate, endDate, action, level } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
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
   * 관리자용 전체 활동 히스토리 조회
   */
  async getAllHistory(query: QueryActivityLogDto) {
    const {
      page = 1,
      limit = 20,
      userId,
      userRole,
      action,
      entityType,
      entityId,
      level,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(userId && { userId }),
      ...(userRole && { userRole }),
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
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
   * 엔티티별 활동 히스토리 조회
   */
  async getEntityHistory(
    entityType: string,
    entityId: number,
    query: QueryActivityLogDto,
  ) {
    const { page = 1, limit = 20, startDate, endDate, action, level } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      entityType,
      entityId,
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
   * 오래된 로그 정리 (1년 이상)
   */
  async cleanupOldLogs(): Promise<number> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await this.prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
        level: { not: 'CRITICAL' }, // CRITICAL 로그는 보존
      },
    });

    this.logger.log(`Cleaned up ${result.count} old activity logs`);
    return result.count;
  }

  /**
   * 활동 로그 생성
   */
  async create(createActivityLogDto: CreateActivityLogDto) {
    return this.prisma.activityLog.create({
      data: createActivityLogDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 특정 활동 로그 조회
   */
  async findOne(id: number) {
    return this.prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 비동기 배치 로깅
   */
  async logBatch(activities: CreateActivityLogDto[]) {
    return this.prisma.activityLog.createMany({
      data: activities,
    });
  }

  /**
   * 중요도별 필터링된 로그 조회
   */
  async getLogsByLevel(level: string, query: QueryActivityLogDto) {
    const { page = 1, limit = 20, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      level,
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
