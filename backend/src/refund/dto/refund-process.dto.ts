import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RefundStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIAL_APPROVED = 'PARTIAL_APPROVED',
}

export class RefundProcessDto {
  @ApiProperty({
    description: '환불 요청 ID (처리할 환불 요청의 고유 ID)',
    example: 1,
    minimum: 1,
  })
  @IsNumber({}, { message: '환불 요청 ID는 숫자여야 합니다.' })
  @Min(1, { message: '환불 요청 ID는 1 이상이어야 합니다.' })
  refundRequestId: number;

  @ApiProperty({
    description:
      '처리 상태 (APPROVED: 승인됨, REJECTED: 거부됨, PARTIAL_APPROVED: 부분 승인됨)',
    enum: RefundStatus,
    example: RefundStatus.APPROVED,
    enumName: 'RefundStatus',
  })
  @IsEnum(RefundStatus, {
    message:
      '유효하지 않은 처리 상태입니다. (APPROVED, REJECTED, PARTIAL_APPROVED 중 하나여야 합니다.)',
  })
  status: RefundStatus;

  @ApiProperty({
    description: '처리 사유 (환불 요청을 승인/거부/부분 승인한 이유)',
    example: '개인 일정 변경으로 인한 환불 요청이 타당하므로 승인합니다.',
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: '처리 사유는 문자열이어야 합니다.' })
  @MinLength(1, { message: '처리 사유는 필수입니다.' })
  @MaxLength(500, { message: '처리 사유는 500자 이하여야 합니다.' })
  processReason: string;

  @ApiProperty({
    description: '실제 환불 금액 (부분 승인 시, 원 단위, 0 이상의 값)',
    example: 40000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '실제 환불 금액은 숫자여야 합니다.' })
  @Min(0, { message: '실제 환불 금액은 0 이상이어야 합니다.' })
  actualRefundAmount?: number;
}
