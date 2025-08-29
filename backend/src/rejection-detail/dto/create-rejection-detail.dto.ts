import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';

export enum RejectionType {
  ENROLLMENT_REJECTION = 'ENROLLMENT_REJECTION',
  REFUND_REJECTION = 'REFUND_REJECTION',
  SESSION_ENROLLMENT_REJECTION = 'SESSION_ENROLLMENT_REJECTION',
}

export class CreateRejectionDetailDto {
  @IsEnum(RejectionType, {
    message:
      '유효하지 않은 거절 타입입니다. (ENROLLMENT_REJECTION, REFUND_REJECTION, SESSION_ENROLLMENT_REJECTION 중 하나여야 합니다.)',
  })
  @IsNotEmpty({ message: '거절 타입은 필수입니다.' })
  rejectionType: RejectionType;

  @IsInt({ message: '엔티티 ID는 정수여야 합니다.' })
  @Min(1, { message: '엔티티 ID는 1 이상이어야 합니다.' })
  @IsNotEmpty({ message: '엔티티 ID는 필수입니다.' })
  entityId: number;

  @IsString({ message: '엔티티 타입은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '엔티티 타입은 필수입니다.' })
  @IsIn(['Enrollment', 'RefundRequest', 'SessionEnrollment'], {
    message:
      '유효하지 않은 엔티티 타입입니다. (Enrollment, RefundRequest, SessionEnrollment 중 하나여야 합니다.)',
  })
  entityType: string; // "Enrollment", "RefundRequest", "SessionEnrollment"

  @IsString({ message: '거절 사유는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '거절 사유는 필수입니다.' })
  @MaxLength(200, { message: '거절 사유는 200자 이하여야 합니다.' })
  reason: string;

  @IsOptional()
  @IsString({ message: '상세 사유는 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '상세 사유는 1000자 이하여야 합니다.' })
  detailedReason?: string;

  @IsInt({ message: '거절 처리자 ID는 정수여야 합니다.' })
  @Min(1, { message: '거절 처리자 ID는 1 이상이어야 합니다.' })
  @IsNotEmpty({ message: '거절 처리자 ID는 필수입니다.' })
  rejectedBy: number;
}
