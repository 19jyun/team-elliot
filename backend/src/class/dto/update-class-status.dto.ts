import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ClassStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export class UpdateClassStatusDto {
  @ApiProperty({
    description: '강의 상태 (DRAFT: 초안, OPEN: 개설됨, CLOSED: 폐강)',
    enum: ClassStatus,
    example: 'OPEN',
    enumName: 'ClassStatus',
  })
  @IsEnum(ClassStatus, {
    message: '강의 상태는 DRAFT, OPEN, CLOSED 중 하나여야 합니다.',
  })
  status: ClassStatus;

  @ApiProperty({
    description: '상태 변경 사유 (선택사항, 최대 500자)',
    example: '강의 승인 완료',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '사유는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '사유는 500자 이하여야 합니다.' })
  reason?: string;
}
