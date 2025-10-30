import { Prisma } from '@prisma/client';
import { anonymizeText } from '../anonymizer/anonymization-rules';
import { addFiveYears } from '../utils/date.utils';

// Retention 스키마의 Enum 타입 정의
type RefundStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * RefundRequest → AnonymizedRefund 마이그레이션
 */

export interface RefundRequestWithRelations {
  id: number;
  sessionEnrollmentId: number;
  studentId: number;
  reason: string;
  detailedReason: string | null;
  refundAmount: Prisma.Decimal;
  status: string;
  processReason: string | null;
  actualRefundAmount: Prisma.Decimal | null;
  processedBy: number | null;
  requestedAt: Date;
  processedAt: Date | null;
  cancelledAt: Date | null;
  sessionEnrollment: {
    session: {
      classId: number;
      class: {
        academyId: number;
      };
    };
  };
  processor?: {
    role: string;
  } | null;
}

export interface AnonymizedRefundData {
  anonymousUserId: number;
  sessionEnrollmentReference: string;
  enrollmentReference: string | null;
  academyId: number;
  classId: number | null;
  reason: string;
  detailedReason: string | null;
  requestedAmount: Prisma.Decimal;
  actualRefundAmount: Prisma.Decimal | null;
  status: RefundStatus;
  processReason: string | null;
  processedByRole: string | null;
  requestedAt: Date;
  processedAt: Date | null;
  completedAt: Date | null;
  dataRetentionUntil: Date;
  originalRefundRequestId: number;
}

/**
 * RefundStatus 문자열을 Enum으로 변환
 */
function mapRefundStatus(status: string): RefundStatus {
  const statusMap: Record<string, RefundStatus> = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  };

  return statusMap[status.toUpperCase()] || 'PENDING';
}

/**
 * RefundRequest를 AnonymizedRefund 데이터로 변환
 */
export function transformRefundToAnonymized(
  refund: RefundRequestWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
): AnonymizedRefundData {
  // completedAt은 COMPLETED 상태이고 processedAt이 있는 경우 설정
  const completedAt =
    refund.status === 'COMPLETED' && refund.processedAt
      ? refund.processedAt
      : null;

  return {
    anonymousUserId,
    sessionEnrollmentReference: refund.sessionEnrollmentId.toString(),
    enrollmentReference: null, // SessionEnrollment는 Enrollment와 별개이며 직접 연결되지 않음
    academyId: refund.sessionEnrollment.session.class.academyId,
    classId: refund.sessionEnrollment.session.classId,
    reason: refund.reason, // 카테고리만 저장 (개인정보 제거)
    detailedReason: anonymizeText(refund.detailedReason), // 익명화 처리
    requestedAmount: refund.refundAmount,
    actualRefundAmount: refund.actualRefundAmount,
    status: mapRefundStatus(refund.status),
    processReason: refund.processReason,
    processedByRole: refund.processor?.role || null, // 역할만 저장
    requestedAt: refund.requestedAt,
    processedAt: refund.processedAt,
    completedAt,
    dataRetentionUntil: addFiveYears(withdrawalDate),
    originalRefundRequestId: refund.id,
  };
}

/**
 * 여러 RefundRequest를 AnonymizedRefund로 일괄 생성
 */
export async function migrateRefunds(
  tx: any, // Prisma.TransactionClient with retention schema
  refunds: RefundRequestWithRelations[],
  anonymousUserId: number,
  withdrawalDate: Date,
): Promise<number> {
  if (refunds.length === 0) {
    return 0;
  }

  const data = refunds.map((refund) =>
    transformRefundToAnonymized(refund, anonymousUserId, withdrawalDate),
  );

  const result = await tx.anonymizedRefund.createMany({
    data,
    skipDuplicates: true,
  });

  return result.count;
}
