import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Server } from 'socket.io';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly logger: Logger,
  ) {}

  get server(): Server {
    return this.socketGateway.server;
  }

  // 기본 발송 메서드들
  async emitToUser(userId: number, event: string, data: any): Promise<void> {
    if (!userId || userId <= 0) {
      throw new BadRequestException({
        code: 'INVALID_USER_ID',
        message: '유효하지 않은 사용자 ID입니다.',
        details: { userId },
      });
    }

    if (!event || typeof event !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_EVENT_NAME',
        message: '유효하지 않은 이벤트 이름입니다.',
        details: { event },
      });
    }

    const startTime = Date.now();
    try {
      this.server.to(`user:${userId}`).emit(event, data);
      this.logEventEmission(
        `user:${userId}`,
        event,
        true,
        Date.now() - startTime,
      );
    } catch (error) {
      this.logEventEmission(
        `user:${userId}`,
        event,
        false,
        Date.now() - startTime,
      );
      throw error;
    }
  }

  async emitToAcademy(
    academyId: number,
    event: string,
    data: any,
  ): Promise<void> {
    if (!academyId || academyId <= 0) {
      throw new BadRequestException({
        code: 'INVALID_ACADEMY_ID',
        message: '유효하지 않은 학원 ID입니다.',
        details: { academyId },
      });
    }

    if (!event || typeof event !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_EVENT_NAME',
        message: '유효하지 않은 이벤트 이름입니다.',
        details: { event },
      });
    }

    const startTime = Date.now();
    try {
      this.server.to(`academy:${academyId}`).emit(event, data);
      this.logEventEmission(
        `academy:${academyId}`,
        event,
        true,
        Date.now() - startTime,
      );
    } catch (error) {
      this.logEventEmission(
        `academy:${academyId}`,
        event,
        false,
        Date.now() - startTime,
      );
      throw error;
    }
  }

  async emitToClass(classId: number, event: string, data: any): Promise<void> {
    if (!classId || classId <= 0) {
      throw new BadRequestException({
        code: 'INVALID_CLASS_ID',
        message: '유효하지 않은 클래스 ID입니다.',
        details: { classId },
      });
    }

    if (!event || typeof event !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_EVENT_NAME',
        message: '유효하지 않은 이벤트 이름입니다.',
        details: { event },
      });
    }

    const startTime = Date.now();
    try {
      this.server.to(`class:${classId}`).emit(event, data);
      this.logEventEmission(
        `class:${classId}`,
        event,
        true,
        Date.now() - startTime,
      );
    } catch (error) {
      this.logEventEmission(
        `class:${classId}`,
        event,
        false,
        Date.now() - startTime,
      );
      throw error;
    }
  }

  async emitToRole(role: string, event: string, data: any): Promise<void> {
    if (!role || typeof role !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_ROLE',
        message: '유효하지 않은 역할입니다.',
        details: { role },
      });
    }

    if (!event || typeof event !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_EVENT_NAME',
        message: '유효하지 않은 이벤트 이름입니다.',
        details: { event },
      });
    }

    const startTime = Date.now();
    try {
      this.server.to(`role:${role}`).emit(event, data);
      this.logEventEmission(
        `role:${role}`,
        event,
        true,
        Date.now() - startTime,
      );
    } catch (error) {
      this.logEventEmission(
        `role:${role}`,
        event,
        false,
        Date.now() - startTime,
      );
      throw error;
    }
  }

  // 배치 발송 메서드
  async emitBatch(events: Array<{ target: string; event: string; data: any }>) {
    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new BadRequestException({
        code: 'INVALID_EVENTS_ARRAY',
        message: '유효하지 않은 이벤트 배열입니다.',
        details: { events },
      });
    }

    const startTime = Date.now();

    for (const { target, event, data } of events) {
      try {
        // 입력 검증
        if (!target || typeof target !== 'string') {
          this.logger.error(`❌ 유효하지 않은 타겟: ${target}`);
          continue;
        }

        if (!event || typeof event !== 'string') {
          this.logger.error(`❌ 유효하지 않은 이벤트: ${event}`);
          continue;
        }

        this.logger.log(`📤 소켓 이벤트 발송: ${event} → ${target}`);
        this.logger.debug(`📤 이벤트 데이터:`, data);

        // 타겟에 따라 다른 방식으로 이벤트 발송
        if (target.startsWith('user:')) {
          const userId = target.replace('user:', '');
          if (!userId || isNaN(Number(userId))) {
            this.logger.error(`❌ 유효하지 않은 사용자 ID: ${userId}`);
            continue;
          }
          this.server.to(`user:${userId}`).emit(event, data);
        } else if (target.startsWith('role:')) {
          const role = target.replace('role:', '');
          if (!role) {
            this.logger.error(`❌ 유효하지 않은 역할: ${role}`);
            continue;
          }
          this.server.to(`role:${role}`).emit(event, data);
        } else if (target.startsWith('academy:')) {
          const academyId = target.replace('academy:', '');
          if (!academyId || isNaN(Number(academyId))) {
            this.logger.error(`❌ 유효하지 않은 학원 ID: ${academyId}`);
            continue;
          }
          this.server.to(`academy:${academyId}`).emit(event, data);
        } else if (target.startsWith('class:')) {
          const classId = target.replace('class:', '');
          if (!classId || isNaN(Number(classId))) {
            this.logger.error(`❌ 유효하지 않은 클래스 ID: ${classId}`);
            continue;
          }
          this.server.to(`class:${classId}`).emit(event, data);
        } else {
          // 기본적으로 모든 클라이언트에게 발송
          this.server.emit(event, data);
        }

        this.logger.log(`✅ 소켓 이벤트 발송 성공: ${event} → ${target}`);
      } catch (error) {
        this.logger.error(
          `❌ 소켓 이벤트 발송 실패: ${event} → ${target}`,
          error,
        );
      }
    }

    const duration = Date.now() - startTime;
    this.logger.log(
      `📊 소켓 이벤트 배치 발송 완료: ${events.length}개 이벤트 (${duration}ms)`,
    );
  }

  private async emitToTarget(
    target: string,
    event: string,
    data: any,
  ): Promise<void> {
    if (!target || typeof target !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_TARGET',
        message: '유효하지 않은 타겟입니다.',
        details: { target },
      });
    }

    const [type, id] = target.split(':');

    if (!type || !id) {
      throw new BadRequestException({
        code: 'INVALID_TARGET_FORMAT',
        message: '유효하지 않은 타겟 형식입니다.',
        details: { target, expectedFormat: 'type:id' },
      });
    }

    switch (type) {
      case 'user':
        return this.emitToUser(Number(id), event, data);
      case 'academy':
        return this.emitToAcademy(Number(id), event, data);
      case 'class':
        return this.emitToClass(Number(id), event, data);
      case 'role':
        return this.emitToRole(id, event, data);
      default:
        throw new BadRequestException({
          code: 'UNKNOWN_TARGET_TYPE',
          message: '알 수 없는 타겟 타입입니다.',
          details: { type, validTypes: ['user', 'academy', 'class', 'role'] },
        });
    }
  }

  private logEventEmission(
    target: string,
    event: string,
    success: boolean,
    duration: number,
  ): void {
    this.logger.log(
      `Socket event: ${event} to ${target} - ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`,
    );

    // TODO: 메트릭 서비스 추가 시 활성화
    // this.metricsService.increment('socket_events_total', {
    //   target,
    //   event,
    //   success: success.toString()
    // });

    // this.metricsService.histogram('socket_event_duration', duration, {
    //   target,
    //   event
    // });
  }
}
