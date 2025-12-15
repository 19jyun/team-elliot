import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CheckPhoneDto {
  @ApiProperty({
    example: '010-1234-5678',
    description: '전화번호 (하이픈 포함)',
  })
  @IsString()
  @Matches(/^01[0-9]-\d{4}-\d{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phoneNumber: string;
}
