import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SmsService {
  async sendVerificationCode(phoneNumber: string): Promise<void> {
    const cleanPhoneNumber = phoneNumber.replace(/-/g, '');

    const phoneRegex = /^01[0|1|6|7|8|9][0-9]{7,8}$/;
    if (!phoneRegex.test(cleanPhoneNumber)) {
      throw new BadRequestException('올바른 전화번호 형식이 아닙니다.');
    }

    // SMS 인증 기능은 추후 구현 예정
    return;
  }

  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    // SMS 인증 기능은 추후 구현 예정
    return true;
  }
}
