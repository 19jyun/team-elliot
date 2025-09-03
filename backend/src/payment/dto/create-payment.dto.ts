import { IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: '세션 수강 신청 ID (결제할 세션 수강 신청의 고유 ID)',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  sessionEnrollmentId: number;

  @ApiProperty({
    description: '학생 ID (결제를 진행하는 학생의 고유 ID)',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  studentId: number;

  @ApiProperty({
    description: '결제 금액 (원 단위, 0보다 큰 값)',
    example: 50000,
    minimum: 1,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description:
      '결제 상태 (PENDING: 대기중, COMPLETED: 완료됨, FAILED: 실패, REFUNDED: 환불됨)',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    example: 'PENDING',
    default: 'PENDING',
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  status?: string;

  @ApiProperty({
    description: '결제 방법 (CARD: 카드, BANK_TRANSFER: 계좌이체, CASH: 현금)',
    enum: ['CARD', 'BANK_TRANSFER', 'CASH'],
    example: 'CARD',
  })
  @IsEnum(['CARD', 'BANK_TRANSFER', 'CASH'])
  method: string;

  @ApiProperty({
    description: '결제 완료 시간 (ISO 8601 형식, 선택사항)',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
