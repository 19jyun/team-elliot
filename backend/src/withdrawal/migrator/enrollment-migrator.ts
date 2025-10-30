import { Prisma } from '@prisma/client';
import { addFiveYears } from '../utils/date.utils';

// Retention 스키마의 Enum 타입 정의
type EnrollmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

/**
 * Enrollment → AnonymizedEnrollment 마이그레이션
 */

export interface EnrollmentWithRelations {
  id: number;
  studentId: number;
  classId: number;
  status: string;
  enrolledAt: Date;
  cancelledAt: Date | null;
  class: {
    id: number;
    className: string;
    academyId: number;
    tuitionFee: Prisma.Decimal;
  };
  payments: Array<{
    amount: Prisma.Decimal;
  }>;
}

export interface AnonymizedEnrollmentData {
  anonymousUserId: number;
  classId: number;
  academyId: number;
  className: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  approvedAt: Date | null;
  cancelledAt: Date | null;
  completedAt: Date | null;
  tuitionFee: Prisma.Decimal;
  paidAmount: Prisma.Decimal | null;
  refundedAmount: Prisma.Decimal | null;
  dataRetentionUntil: Date;
  originalEnrollmentId: number;
}

/**
 * EnrollmentStatus 문자열을 Enum으로 변환
 */
function mapEnrollmentStatus(status: string): EnrollmentStatus {
  const statusMap: Record<string, EnrollmentStatus> = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
  };

  return statusMap[status.toUpperCase()] || 'PENDING';
}

/**
 * Enrollment를 AnonymizedEnrollment 데이터로 변환
 */
export function transformEnrollmentToAnonymized(
  enrollment: EnrollmentWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
  refundedAmount?: Prisma.Decimal | null,
): AnonymizedEnrollmentData {
  // 결제 금액 합계 계산
  const paidAmount = enrollment.payments.reduce(
    (sum, payment) => sum.plus(payment.amount),
    new Prisma.Decimal(0),
  );

  // 승인 일시 추정 (상태가 APPROVED 이상이고 enrolledAt 이후인 경우)
  const approvedAt =
    enrollment.status === 'APPROVED' || enrollment.status === 'COMPLETED'
      ? enrollment.enrolledAt
      : null;

  // 완료 일시 (COMPLETED 상태인 경우)
  const completedAt =
    enrollment.status === 'COMPLETED' ? enrollment.enrolledAt : null;

  return {
    anonymousUserId,
    classId: enrollment.classId,
    academyId: enrollment.class.academyId,
    className: enrollment.class.className,
    status: mapEnrollmentStatus(enrollment.status),
    enrolledAt: enrollment.enrolledAt,
    approvedAt,
    cancelledAt: enrollment.cancelledAt,
    completedAt,
    tuitionFee: enrollment.class.tuitionFee,
    paidAmount: paidAmount.gt(0) ? paidAmount : null,
    refundedAmount: refundedAmount || null,
    dataRetentionUntil: addFiveYears(withdrawalDate),
    originalEnrollmentId: enrollment.id,
  };
}

/**
 * 여러 Enrollment를 AnonymizedEnrollment로 일괄 생성
 */
export async function migrateEnrollments(
  tx: any, // Prisma.TransactionClient with retention schema
  enrollments: EnrollmentWithRelations[],
  anonymousUserId: number,
  withdrawalDate: Date,
  refundedAmounts?: Map<number, Prisma.Decimal>,
): Promise<number> {
  if (enrollments.length === 0) {
    return 0;
  }

  const data = enrollments.map((enrollment) =>
    transformEnrollmentToAnonymized(
      enrollment,
      anonymousUserId,
      withdrawalDate,
      refundedAmounts?.get(enrollment.id),
    ),
  );

  const result = await tx.anonymizedEnrollment.createMany({
    data,
    skipDuplicates: true,
  });

  return result.count;
}
