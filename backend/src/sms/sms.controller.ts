import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send-verification')
  async sendVerification(@Body('phoneNumber') phoneNumber: string) {
    if (!phoneNumber) {
      throw new BadRequestException('전화번호를 입력해주세요.');
    }

    await this.smsService.sendVerificationCode(phoneNumber);
    return { message: '인증번호가 발송되었습니다.' };
  }

  @Post('verify-code')
  async verifyCode(
    @Body('phoneNumber') phoneNumber: string,
    @Body('code') code: string,
  ) {
    if (!phoneNumber || !code) {
      throw new BadRequestException('전화번호와 인증번호를 모두 입력해주세요.');
    }

    const isVerified = await this.smsService.verifyCode(phoneNumber, code);
    return {
      verified: isVerified,
      message: '인증이 완료되었습니다.',
    };
  }
}
