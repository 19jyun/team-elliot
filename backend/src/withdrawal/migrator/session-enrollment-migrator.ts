import { Prisma } from '@prisma/client';
import { addFiveYears } from '../utils/date.utils';

// Retention 스키마의 Enum 타입 정의
type SessionEnrollmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

/**
 * SessionEnrollment → AnonymizedSessionEnrollment 마이그레이션
 */

export interface SessionEnrollmentWithRelations {
  id: number;
  studentId: number;
  sessionId: number;
  status: string;
  enrolledAt: Date;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
  session: {
    id: number;
    date: Date;
    classId: number;
    class: {
      academyId: number;
    };
  };
}

export interface AnonymizedSessionEnrollmentData {
  anonymousUserId: number;
  sessionId: number;
  classId: number;
  academyId: number;
  sessionDate: Date;
  status: SessionEnrollmentStatus;
  enrolledAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
  dataRetentionUntil: Date;
  originalSessionEnrollmentId: number;
}

/**
 * SessionEnrollmentStatus 문자열을 Enum으로 변환
 */
function mapSessionEnrollmentStatus(status: string): SessionEnrollmentStatus {
  const statusMap: Record<string, SessionEnrollmentStatus> = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    CONFIRMED: 'APPROVED', // CONFIRMED는 APPROVED로 매핑
    ATTENDED: 'COMPLETED', // ATTENDED는 COMPLETED로 매핑
    REFUND_REQUESTED: 'CANCELLED', // 환불 요청은 취소로 처리
  };

  return statusMap[status.toUpperCase()] || 'PENDING';
}

/**
 * SessionEnrollment를 AnonymizedSessionEnrollment 데이터로 변환
 */
export function transformSessionEnrollmentToAnonymized(
  sessionEnrollment: SessionEnrollmentWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
): AnonymizedSessionEnrollmentData {
  // 승인 일시 추정 (상태가 APPROVED 이상이고 rejectedAt이 없는 경우)
  const approvedAt =
    (sessionEnrollment.status === 'CONFIRMED' ||
      sessionEnrollment.status === 'APPROVED' ||
      sessionEnrollment.status === 'ATTENDED') &&
    !sessionEnrollment.rejectedAt
      ? sessionEnrollment.enrolledAt
      : null;

  return {
    anonymousUserId,
    sessionId: sessionEnrollment.sessionId,
    classId: sessionEnrollment.session.classId,
    academyId: sessionEnrollment.session.class.academyId,
    sessionDate: sessionEnrollment.session.date,
    status: mapSessionEnrollmentStatus(sessionEnrollment.status),
    enrolledAt: sessionEnrollment.enrolledAt,
    approvedAt,
    rejectedAt: sessionEnrollment.rejectedAt,
    cancelledAt: sessionEnrollment.cancelledAt,
    dataRetentionUntil: addFiveYears(withdrawalDate),
    originalSessionEnrollmentId: sessionEnrollment.id,
  };
}

/**
 * 여러 SessionEnrollment를 AnonymizedSessionEnrollment로 일괄 생성
 */
export async function migrateSessionEnrollments(
  tx: any, // Prisma.TransactionClient with retention schema
  sessionEnrollments: SessionEnrollmentWithRelations[],
  anonymousUserId: number,
  withdrawalDate: Date,
): Promise<number> {
  if (sessionEnrollments.length === 0) {
    return 0;
  }

  const data = sessionEnrollments.map((sessionEnrollment) =>
    transformSessionEnrollmentToAnonymized(
      sessionEnrollment,
      anonymousUserId,
      withdrawalDate,
    ),
  );

  const result = await tx.anonymizedSessionEnrollment.createMany({
    data,
    skipDuplicates: true,
  });

  return result.count;
}
