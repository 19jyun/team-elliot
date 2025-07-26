import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ClassStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export class UpdateClassStatusDto {
  @ApiProperty({
    description: '강의 상태',
    enum: ClassStatus,
    example: 'OPEN',
  })
  @IsEnum(ClassStatus)
  status: ClassStatus;

  @ApiProperty({
    description: '상태 변경 사유 (선택사항)',
    example: '강의 승인 완료',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
