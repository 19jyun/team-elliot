import { Prisma } from '@prisma/client';
import { addFiveYears } from '../utils/date.utils';

// Retention 스키마의 Enum 타입 정의
type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

/**
 * Payment → AnonymizedPayment 마이그레이션
 */

export interface PaymentWithRelations {
  id: number;
  studentId: number;
  amount: Prisma.Decimal;
  status: string;
  method: string;
  paidAt: Date | null;
  sessionEnrollmentId: number;
  sessionEnrollment: {
    session: {
      classId: number;
      class: {
        academyId: number;
      };
    };
  };
}

export interface AnonymizedPaymentData {
  anonymousUserId: number;
  sessionEnrollmentReference: string;
  academyId: number;
  classId: number | null;
  amount: Prisma.Decimal;
  method: string;
  status: PaymentStatus;
  paidAt: Date | null;
  receiptNumber: string | null;
  dataRetentionUntil: Date;
  originalPaymentId: number;
}

/**
 * PaymentStatus 문자열을 Enum으로 변환
 */
function mapPaymentStatus(status: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED',
  };

  return statusMap[status.toUpperCase()] || 'PENDING';
}

/**
 * Payment를 AnonymizedPayment 데이터로 변환
 */
export function transformPaymentToAnonymized(
  payment: PaymentWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
): AnonymizedPaymentData {
  return {
    anonymousUserId,
    sessionEnrollmentReference: payment.sessionEnrollmentId.toString(),
    academyId: payment.sessionEnrollment.session.class.academyId,
    classId: payment.sessionEnrollment.session.classId,
    amount: payment.amount,
    method: payment.method,
    status: mapPaymentStatus(payment.status),
    paidAt: payment.paidAt,
    receiptNumber: null, // 개인정보 제거
    dataRetentionUntil: addFiveYears(withdrawalDate),
    originalPaymentId: payment.id,
  };
}

/**
 * 여러 Payment를 AnonymizedPayment로 일괄 생성
 */
export async function migratePayments(
  tx: any, // Prisma.TransactionClient with retention schema
  payments: PaymentWithRelations[],
  anonymousUserId: number,
  withdrawalDate: Date,
): Promise<number> {
  if (payments.length === 0) {
    return 0;
  }

  const data = payments.map((payment) =>
    transformPaymentToAnonymized(payment, anonymousUserId, withdrawalDate),
  );

  const result = await tx.anonymizedPayment.createMany({
    data,
    skipDuplicates: true,
  });

  return result.count;
}
