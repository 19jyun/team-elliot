import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RefundReason {
  PERSONAL_SCHEDULE = 'PERSONAL_SCHEDULE',
  HEALTH_ISSUE = 'HEALTH_ISSUE',
  DISSATISFACTION = 'DISSATISFACTION',
  FINANCIAL_ISSUE = 'FINANCIAL_ISSUE',
  OTHER = 'OTHER',
}

export class RefundRequestDto {
  @ApiProperty({ description: '세션 수강 신청 ID' })
  @IsNumber()
  sessionEnrollmentId: number;

  @ApiProperty({ description: '환불 사유', enum: RefundReason })
  @IsEnum(RefundReason)
  reason: RefundReason;

  @ApiProperty({ description: '상세 사유 (선택사항)' })
  @IsOptional()
  @IsString()
  detailedReason?: string;

  @ApiProperty({ description: '환불 요청 금액' })
  @IsNumber()
  refundAmount: number;
}
