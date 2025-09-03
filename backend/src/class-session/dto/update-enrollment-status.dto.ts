import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SessionEnrollmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUND_CANCELLED = 'REFUND_CANCELLED',
  REFUND_REJECTED_CONFIRMED = 'REFUND_REJECTED_CONFIRMED',
  TEACHER_CANCELLED = 'TEACHER_CANCELLED',
  ABSENT = 'ABSENT',
  ATTENDED = 'ATTENDED',
}

export class UpdateEnrollmentStatusDto {
  @ApiProperty({
    description:
      '수강 신청 상태 (PENDING: 대기중, CONFIRMED: 승인됨, REJECTED: 거부됨, CANCELLED: 취소됨, REFUND_REQUESTED: 환불 요청됨, REFUND_CANCELLED: 환불 취소됨, REFUND_REJECTED_CONFIRMED: 환불 거부됨, TEACHER_CANCELLED: 강사 취소, ABSENT: 결석, ATTENDED: 출석)',
    enum: SessionEnrollmentStatus,
    example: SessionEnrollmentStatus.CONFIRMED,
    enumName: 'SessionEnrollmentStatus',
  })
  @IsEnum(SessionEnrollmentStatus, {
    message:
      '유효하지 않은 수강 신청 상태입니다. (PENDING, CONFIRMED, REJECTED, CANCELLED, REFUND_REQUESTED, REFUND_CANCELLED, REFUND_REJECTED_CONFIRMED, TEACHER_CANCELLED, ABSENT, ATTENDED 중 하나여야 합니다.)',
  })
  status: SessionEnrollmentStatus;

  @ApiProperty({
    description: '상태 변경 사유 (선택사항, 최대 500자)',
    example: '수업 인원 충족으로 승인',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '사유는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '사유는 500자 이하여야 합니다.' })
  reason?: string;
}

export class BatchUpdateEnrollmentStatusDto {
  @ApiProperty({
    description:
      '수강 신청 ID 목록 (한 번에 처리할 수강 신청들의 고유 ID 배열)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  enrollmentIds: number[];

  @ApiProperty({
    description:
      '수강 신청 상태 (PENDING: 대기중, CONFIRMED: 승인됨, REJECTED: 거부됨, CANCELLED: 취소됨, REFUND_REQUESTED: 환불 요청됨, REFUND_CANCELLED: 환불 취소됨, REFUND_REJECTED_CONFIRMED: 환불 거부됨, TEACHER_CANCELLED: 강사 취소, ABSENT: 결석, ATTENDED: 출석)',
    enum: SessionEnrollmentStatus,
    example: SessionEnrollmentStatus.CONFIRMED,
    enumName: 'SessionEnrollmentStatus',
  })
  @IsEnum(SessionEnrollmentStatus, {
    message:
      '유효하지 않은 수강 신청 상태입니다. (PENDING, CONFIRMED, REJECTED, CANCELLED, REFUND_REQUESTED, REFUND_CANCELLED, REFUND_REJECTED_CONFIRMED, TEACHER_CANCELLED, ABSENT, ATTENDED 중 하나여야 합니다.)',
  })
  status: SessionEnrollmentStatus;

  @ApiProperty({
    description: '상태 변경 사유 (선택사항, 최대 500자)',
    example: '일괄 승인 처리',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '사유는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '사유는 500자 이하여야 합니다.' })
  reason?: string;
}
