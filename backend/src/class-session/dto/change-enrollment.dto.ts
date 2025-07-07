import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEnrollmentDto {
  @ApiProperty({
    description: '변경할 새로운 세션 ID',
    example: 2,
  })
  @IsNumber()
  newSessionId: number;

  @ApiProperty({
    description: '변경 사유 (선택사항)',
    example: '스케줄 변경으로 인한 수강 변경',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
