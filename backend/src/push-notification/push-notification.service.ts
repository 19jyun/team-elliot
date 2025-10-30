import { Injectable, Logger } from '@nestjs/common';
import { DeviceService } from '../device/device.service';
import { FirebaseService, PushPayload } from '../firebase/firebase.service';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private deviceService: DeviceService,
    private firebaseService: FirebaseService,
  ) {}

  /**
   * 특정 사용자에게 푸시 알림 전송
   * @param userId 사용자 ID (User 테이블의 id)
   * @param payload 푸시 알림 페이로드
   */
  async sendToUser(userId: number, payload: PushPayload): Promise<void> {
    try {
      const tokens = await this.deviceService.getActiveTokens(userId);

      if (tokens.length === 0) {
        this.logger.debug(`사용자 ${userId}에게 활성 토큰이 없습니다`);
        return;
      }

      await this.firebaseService.sendToMultipleDevices(tokens, payload);
      this.logger.log(
        `✅ 푸시 알림 전송 완료: 사용자 ${userId} (${tokens.length}개 기기)`,
      );
    } catch (error) {
      this.logger.error(`❌ 푸시 알림 전송 실패: 사용자 ${userId}`, error);
      // 에러 발생해도 비즈니스 로직에 영향 없도록 처리
    }
  }

  /**
   * 여러 사용자에게 푸시 알림 배치 전송
   * @param userIds 사용자 ID 배열
   * @param payload 푸시 알림 페이로드
   */
  async sendToUsers(userIds: number[], payload: PushPayload): Promise<void> {
    try {
      const tokenMap =
        await this.deviceService.getActiveTokensForUsers(userIds);

      const allTokens: string[] = [];
      tokenMap.forEach((tokens) => {
        allTokens.push(...tokens);
      });

      if (allTokens.length === 0) {
        this.logger.debug(`대상 사용자들에게 활성 토큰이 없습니다`);
        return;
      }

      await this.firebaseService.sendToMultipleDevices(allTokens, payload);
      this.logger.log(
        `✅ 푸시 알림 배치 전송 완료: ${userIds.length}명 (${allTokens.length}개 기기)`,
      );
    } catch (error) {
      this.logger.error('❌ 푸시 알림 배치 전송 실패', error);
    }
  }
}
