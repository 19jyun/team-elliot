import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    // Twilio 클라이언트 초기화는 필요할 때 동적으로 로드
  }

  private async getTwilioClient() {
    if (!this.twilioClient) {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

      if (accountSid && authToken) {
        const twilio = await import('twilio');
        this.twilioClient = twilio.default(accountSid, authToken);
      }
    }
    return this.twilioClient;
  }

  async sendVerificationCode(phoneNumber: string): Promise<void> {
    const cleanPhoneNumber = phoneNumber.replace(/-/g, '');

    const phoneRegex = /^01[0|1|6|7|8|9][0-9]{7,8}$/;
    if (!phoneRegex.test(cleanPhoneNumber)) {
      throw new BadRequestException('올바른 전화번호 형식이 아닙니다.');
    }

    // 한국 전화번호를 국제 형식으로 변환 (+82)
    const internationalPhoneNumber =
      this.convertToInternationalFormat(cleanPhoneNumber);

    try {
      const verifyServiceSid = this.configService.get<string>(
        'TWILIO_VERIFY_SERVICE_SID',
      );

      const twilioClient = await this.getTwilioClient();
      if (!twilioClient || !verifyServiceSid) {
        throw new BadRequestException('SMS 서비스가 설정되지 않았습니다.');
      }

      // Twilio Verify 서비스를 사용하여 인증 코드 발송
      await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications.create({
          to: internationalPhoneNumber,
          channel: 'sms',
        });

      console.log(`인증 코드가 ${internationalPhoneNumber}로 발송되었습니다.`);
    } catch (error) {
      console.error('SMS 발송 실패:', error);
      throw new BadRequestException(
        '인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    const cleanPhoneNumber = phoneNumber.replace(/-/g, '');
    const internationalPhoneNumber =
      this.convertToInternationalFormat(cleanPhoneNumber);

    try {
      const verifyServiceSid = this.configService.get<string>(
        'TWILIO_VERIFY_SERVICE_SID',
      );

      const twilioClient = await this.getTwilioClient();
      if (!twilioClient || !verifyServiceSid) {
        throw new BadRequestException('SMS 서비스가 설정되지 않았습니다.');
      }

      // Twilio Verify 서비스를 사용하여 인증 코드 검증
      const verificationCheck = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({
          to: internationalPhoneNumber,
          code: code,
        });

      return verificationCheck.status === 'approved';
    } catch (error) {
      console.error('인증 코드 검증 실패:', error);
      return false;
    }
  }

  private convertToInternationalFormat(phoneNumber: string): string {
    // 01012345678 -> +821012345678
    if (phoneNumber.startsWith('0')) {
      return '+82' + phoneNumber.substring(1);
    }
    return phoneNumber;
  }
}
