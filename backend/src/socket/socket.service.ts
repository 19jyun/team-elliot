import { Injectable, Logger } from '@nestjs/common';
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
    const startTime = Date.now();

    for (const { target, event, data } of events) {
      try {
        this.logger.log(`📤 소켓 이벤트 발송: ${event} → ${target}`);
        this.logger.debug(`📤 이벤트 데이터:`, data);

        // 타겟에 따라 다른 방식으로 이벤트 발송
        if (target.startsWith('user:')) {
          const userId = target.replace('user:', '');
          this.server.to(`user:${userId}`).emit(event, data);
        } else if (target.startsWith('role:')) {
          const role = target.replace('role:', '');
          this.server.to(`role:${role}`).emit(event, data);
        } else if (target.startsWith('academy:')) {
          const academyId = target.replace('academy:', '');
          this.server.to(`academy:${academyId}`).emit(event, data);
        } else if (target.startsWith('class:')) {
          const classId = target.replace('class:', '');
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
    const [type, id] = target.split(':');

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
        throw new Error(`Unknown target type: ${type}`);
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
