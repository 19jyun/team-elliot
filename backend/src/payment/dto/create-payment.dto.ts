import { IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: '세션 수강 신청 ID' })
  @IsNumber()
  sessionEnrollmentId: number;

  @ApiProperty({ description: '학생 ID' })
  @IsNumber()
  studentId: number;

  @ApiProperty({ description: '결제 금액' })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: '결제 상태',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
  })
  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  status?: string;

  @ApiProperty({
    description: '결제 방법',
    enum: ['CARD', 'BANK_TRANSFER', 'CASH'],
  })
  @IsEnum(['CARD', 'BANK_TRANSFER', 'CASH'])
  method: string;

  @ApiProperty({ description: '결제 완료 시간' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
