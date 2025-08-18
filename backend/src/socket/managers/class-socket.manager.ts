import { Injectable, Logger } from '@nestjs/common';
import { UniversalSocketManager } from './universal-socket.manager';

@Injectable()
export class ClassSocketManager {
  constructor(
    private readonly universalSocketManager: UniversalSocketManager,
    private readonly logger: Logger,
  ) {}

  // 클래스 생성 알림
  async notifyClassCreated(classData: any): Promise<void> {
    try {
      this.logger.log(`📢 클래스 생성 알림: ${classData.id}`);

      await this.universalSocketManager.notifyClassEvent(
        'class_created',
        classData,
        '새로운 클래스가 생성되었습니다.',
      );

      this.logger.log(`✅ 클래스 생성 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 클래스 생성 알림 실패', error);
    }
  }

  // 클래스 정보 변경 알림
  async notifyClassInfoChanged(classData: any): Promise<void> {
    try {
      this.logger.log(`📢 클래스 정보 변경 알림: ${classData.id}`);

      await this.universalSocketManager.notifyClassEvent(
        'class_info_changed',
        classData,
        '클래스 정보가 업데이트되었습니다.',
      );

      this.logger.log(`✅ 클래스 정보 변경 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 클래스 정보 변경 알림 실패', error);
    }
  }

  // 클래스 상태 변경 알림
  async notifyClassStatusChanged(classData: any): Promise<void> {
    try {
      this.logger.log(`📢 클래스 상태 변경 알림: ${classData.id}`);

      await this.universalSocketManager.notifyClassEvent(
        'class_status_changed',
        classData,
        '클래스 상태가 변경되었습니다.',
      );

      this.logger.log(`✅ 클래스 상태 변경 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 클래스 상태 변경 알림 실패', error);
    }
  }

  // 세션 내용 업데이트 알림
  async notifySessionContentUpdated(
    sessionId: number,
    // classId: number,
    // academyId: number,
    // contentId?: number,
    // poseId?: number,
  ): Promise<void> {
    try {
      this.logger.log(`📢 세션 내용 업데이트 알림: ${sessionId}`);

      // const sessionData = {
      //   sessionId,
      //   classId,
      //   academyId,
      //   contentId,
      //   poseId,
      // };

      await this.universalSocketManager.notifyUpdateRequired(
        'session_content_updated',
        [
          {
            userId: 0, // 모든 사용자에게 알림
            userRole: 'STUDENT' as const,
          },
        ],
        '세션 내용이 업데이트되었습니다.',
      );

      this.logger.log(`✅ 세션 내용 업데이트 알림 완료`);
    } catch (error) {
      this.logger.error('❌ 세션 내용 업데이트 알림 실패', error);
    }
  }
}
