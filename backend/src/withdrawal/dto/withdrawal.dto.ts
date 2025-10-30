import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WithdrawalDto {
  @ApiProperty({
    example: '더 이상 사용하지 않아서',
    description: '회원 탈퇴 사유',
  })
  @IsString()
  reason: string;
}
