import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RefundStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIAL_APPROVED = 'PARTIAL_APPROVED',
}

export class RefundProcessDto {
  @ApiProperty({ description: '환불 요청 ID' })
  @IsNumber()
  refundRequestId: number;

  @ApiProperty({ description: '처리 상태', enum: RefundStatus })
  @IsEnum(RefundStatus)
  status: RefundStatus;

  @ApiProperty({ description: '처리 사유' })
  @IsString()
  processReason: string;

  @ApiProperty({ description: '실제 환불 금액 (부분 승인 시)' })
  @IsOptional()
  @IsNumber()
  actualRefundAmount?: number;
}
