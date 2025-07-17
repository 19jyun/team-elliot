import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum RejectionType {
  ENROLLMENT_REJECTION = 'ENROLLMENT_REJECTION',
  REFUND_REJECTION = 'REFUND_REJECTION',
  SESSION_ENROLLMENT_REJECTION = 'SESSION_ENROLLMENT_REJECTION',
}

export class CreateRejectionDetailDto {
  @IsEnum(RejectionType)
  @IsNotEmpty()
  rejectionType: RejectionType;

  @IsInt()
  @IsNotEmpty()
  entityId: number;

  @IsString()
  @IsNotEmpty()
  entityType: string; // "Enrollment", "RefundRequest", "SessionEnrollment"

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  detailedReason?: string;

  @IsInt()
  @IsNotEmpty()
  rejectedBy: number;
}
