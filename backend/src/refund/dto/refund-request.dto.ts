import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
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
  @IsNumber({}, { message: '세션 수강 신청 ID는 숫자여야 합니다.' })
  @Min(1, { message: '세션 수강 신청 ID는 1 이상이어야 합니다.' })
  sessionEnrollmentId: number;

  @ApiProperty({ description: '환불 사유', enum: RefundReason })
  @IsEnum(RefundReason, {
    message:
      '유효하지 않은 환불 사유입니다. (PERSONAL_SCHEDULE, HEALTH_ISSUE, DISSATISFACTION, FINANCIAL_ISSUE, OTHER 중 하나여야 합니다.)',
  })
  reason: RefundReason;

  @ApiProperty({ description: '상세 사유 (선택사항)' })
  @IsOptional()
  @IsString({ message: '상세 사유는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '상세 사유는 500자 이하여야 합니다.' })
  detailedReason?: string;

  @ApiProperty({ description: '환불 요청 금액' })
  @IsNumber({}, { message: '환불 요청 금액은 숫자여야 합니다.' })
  @Min(0, { message: '환불 요청 금액은 0 이상이어야 합니다.' })
  refundAmount: number;

  @ApiProperty({ description: '은행명 (선택사항)' })
  @IsOptional()
  @IsString({ message: '은행명은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '은행명은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '은행명은 한글, 영문, 공백만 사용 가능합니다.',
  })
  bankName?: string;

  @ApiProperty({ description: '계좌번호 (선택사항)' })
  @IsOptional()
  @IsString({ message: '계좌번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '계좌번호는 20자 이하여야 합니다.' })
  @Matches(/^[0-9-]+$/, {
    message: '계좌번호는 숫자와 하이픈만 사용 가능합니다.',
  })
  accountNumber?: string;

  @ApiProperty({ description: '예금주 (선택사항)' })
  @IsOptional()
  @IsString({ message: '예금주는 문자열이어야 합니다.' })
  @MaxLength(50, { message: '예금주는 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '예금주는 한글, 영문, 공백만 사용 가능합니다.',
  })
  accountHolder?: string;
}
