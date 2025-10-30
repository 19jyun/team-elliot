import { Injectable, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(@Inject('FIREBASE_ADMIN') private admin: admin.app.App) {}

  async sendToDevice(token: string, payload: PushPayload): Promise<void> {
    try {
      await this.admin.messaging().send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
        },
      });
      this.logger.log(`✅ FCM 메시지 전송 성공: ${token.substring(0, 20)}...`);
    } catch (error) {
      this.logger.error(
        `❌ FCM 메시지 전송 실패: ${token.substring(0, 20)}...`,
        error,
      );
      throw error;
    }
  }

  async sendToMultipleDevices(
    tokens: string[],
    payload: PushPayload,
  ): Promise<void> {
    if (tokens.length === 0) {
      this.logger.debug('전송할 토큰이 없습니다');
      return;
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
        },
      };

      const response = await this.admin
        .messaging()
        .sendEachForMulticast(message);

      this.logger.log(
        `✅ FCM 배치 전송 완료: ${response.successCount}/${tokens.length}개 성공`,
      );

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.warn(`FCM 전송 실패 [${idx}]: ${resp.error?.message}`);
          }
        });
      }
    } catch (error) {
      this.logger.error('❌ FCM 배치 전송 실패', error);
      throw error;
    }
  }
}
