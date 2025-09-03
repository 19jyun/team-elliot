import { IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiProperty({
    description:
      '결제 상태 (PENDING: 대기중, COMPLETED: 완료됨, FAILED: 실패, REFUNDED: 환불됨)',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    example: 'COMPLETED',
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  status?: string;

  @ApiProperty({
    description: '결제 방법 (CARD: 카드, BANK_TRANSFER: 계좌이체, CASH: 현금)',
    enum: ['CARD', 'BANK_TRANSFER', 'CASH'],
    example: 'CARD',
    required: false,
  })
  @IsOptional()
  @IsEnum(['CARD', 'BANK_TRANSFER', 'CASH'])
  method?: string;

  @ApiProperty({
    description: '결제 완료 시간 (ISO 8601 형식, 선택사항)',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiProperty({
    description: '결제 금액 (원 단위, 0보다 큰 값, 선택사항)',
    example: 60000,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;
}
