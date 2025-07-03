import { IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto {
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
  @IsOptional()
  @IsEnum(['CARD', 'BANK_TRANSFER', 'CASH'])
  method?: string;

  @ApiProperty({ description: '결제 완료 시간' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiProperty({ description: '결제 금액' })
  @IsOptional()
  @IsNumber()
  amount?: number;
}
