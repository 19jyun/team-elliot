import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WithdrawalReasonDto {
  @ApiProperty({ example: '더 이상 사용하지 않아서' })
  @IsString()
  reason: string;
}
