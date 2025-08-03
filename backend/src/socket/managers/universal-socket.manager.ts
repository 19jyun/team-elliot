import { Injectable, Logger } from '@nestjs/common';
import { SocketService } from '../socket.service';
import { SocketTargetResolver } from '../resolvers/socket-target.resolver';
import { UpdateRequiredEvent } from '../events/universal.events';

@Injectable()
export class UniversalSocketManager {
  constructor(
    private readonly socketService: SocketService,
    private readonly targetResolver: SocketTargetResolver,
    private readonly logger: Logger,
  ) {}

  // 단순화된 업데이트 알림 - 모든 소켓 이벤트를 update_required로 통합
  async notifyUpdateRequired(
    sourceEvent: string,
    affectedUsers: {
      userId: number;
      userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
    }[],
    message?: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `📢 업데이트 필요 알림: ${sourceEvent} (${affectedUsers.length}명)`,
      );

      const eventData: UpdateRequiredEvent = {
        type: 'update_required',
        sourceEvent,
        affectedUsers,
        timestamp: new Date(),
        message,
      };

      // 각 사용자에게 개별적으로 이벤트 전송
      const targets = await Promise.all(
        affectedUsers.map(async (user) => {
          return await this.targetResolver.resolveUserTarget(
            user.userId,
            user.userRole,
          );
        }),
      );

      // 유효한 타겟들만 필터링
      const validTargets = targets.filter((target) => target !== null);

      await this.socketService.emitBatch(
        validTargets.map((target) => ({
          target,
          event: 'update_required',
          data: eventData,
        })),
      );

      this.logger.log(
        `✅ 업데이트 필요 알림 완료: ${validTargets.length}명에게 전송`,
      );
    } catch (error) {
      this.logger.error('❌ 업데이트 필요 알림 실패', error);
    }
  }

  // 수강신청 관련 이벤트를 update_required로 변환
  async notifyEnrollmentEvent(
    sourceEvent: string,
    enrollment: any,
    message?: string,
  ): Promise<void> {
    this.logger.log(`🎯 수강신청 이벤트 처리 시작: ${sourceEvent}`, {
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      classId: enrollment.session?.classId,
    });

    const affectedUsers =
      await this.targetResolver.resolveEnrollmentEventTargets(enrollment);

    this.logger.log(`👥 수강신청 이벤트 타겟 사용자:`, affectedUsers);

    await this.notifyUpdateRequired(sourceEvent, affectedUsers, message);
  }

  // 환불요청 관련 이벤트를 update_required로 변환
  async notifyRefundEvent(
    sourceEvent: string,
    refundRequest: any,
    message?: string,
  ): Promise<void> {
    const affectedUsers =
      await this.targetResolver.resolveRefundEventTargets(refundRequest);
    await this.notifyUpdateRequired(sourceEvent, affectedUsers, message);
  }

  // 클래스 관련 이벤트를 update_required로 변환
  async notifyClassEvent(
    sourceEvent: string,
    classData: any,
    message?: string,
  ): Promise<void> {
    const affectedUsers =
      await this.targetResolver.resolveClassEventTargets(classData);
    await this.notifyUpdateRequired(sourceEvent, affectedUsers, message);
  }

  // 학원 관련 이벤트를 update_required로 변환
  async notifyAcademyEvent(
    sourceEvent: string,
    academyData: any,
    message?: string,
  ): Promise<void> {
    const affectedUsers =
      await this.targetResolver.resolveAcademyEventTargets(academyData);
    await this.notifyUpdateRequired(sourceEvent, affectedUsers, message);
  }
}
