import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SessionEnrollmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ABSENT = 'ABSENT',
  ATTENDED = 'ATTENDED',
}

export class UpdateEnrollmentStatusDto {
  @ApiProperty({
    description: '수강 신청 상태',
    enum: SessionEnrollmentStatus,
    example: SessionEnrollmentStatus.CONFIRMED,
  })
  @IsEnum(SessionEnrollmentStatus)
  status: SessionEnrollmentStatus;

  @ApiProperty({
    description: '상태 변경 사유 (선택사항)',
    example: '수업 인원 충족으로 승인',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BatchUpdateEnrollmentStatusDto {
  @ApiProperty({
    description: '수강 신청 ID 목록',
    example: [1, 2, 3, 4, 5],
  })
  enrollmentIds: number[];

  @ApiProperty({
    description: '수강 신청 상태',
    enum: SessionEnrollmentStatus,
    example: SessionEnrollmentStatus.CONFIRMED,
  })
  @IsEnum(SessionEnrollmentStatus)
  status: SessionEnrollmentStatus;

  @ApiProperty({
    description: '상태 변경 사유 (선택사항)',
    example: '일괄 승인 처리',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
