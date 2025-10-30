import { Prisma } from '@prisma/client';
import { anonymizeText } from '../anonymizer/anonymization-rules';
import { addThreeYears } from '../utils/date.utils';

// Retention 스키마의 Enum 타입 정의
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

/**
 * Attendance → AnonymizedAttendance 마이그레이션
 */

export interface AttendanceWithRelations {
  id: number;
  sessionEnrollmentId: number;
  classId: number;
  studentId: number;
  date: Date;
  status: string;
  note: string | null;
  class: {
    academyId: number;
  };
}

export interface AnonymizedAttendanceData {
  anonymousUserId: number;
  classId: number;
  academyId: number;
  sessionEnrollmentReference: string;
  attendanceDate: Date;
  status: AttendanceStatus;
  note: string | null;
  dataRetentionUntil: Date;
  originalAttendanceId: number;
}

/**
 * AttendanceStatus 문자열을 Enum으로 변환
 */
function mapAttendanceStatus(status: string): AttendanceStatus {
  const statusMap: Record<string, AttendanceStatus> = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
    EXCUSED: 'EXCUSED',
  };

  return statusMap[status.toUpperCase()] || 'ABSENT';
}

/**
 * Attendance를 AnonymizedAttendance 데이터로 변환
 */
export function transformAttendanceToAnonymized(
  attendance: AttendanceWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
): AnonymizedAttendanceData {
  return {
    anonymousUserId,
    classId: attendance.classId,
    academyId: attendance.class.academyId,
    sessionEnrollmentReference: attendance.sessionEnrollmentId.toString(),
    attendanceDate: attendance.date,
    status: mapAttendanceStatus(attendance.status),
    note: anonymizeText(attendance.note), // 개인정보 익명화 처리
    dataRetentionUntil: addThreeYears(withdrawalDate), // 출석은 3년 보관
    originalAttendanceId: attendance.id,
  };
}

/**
 * 여러 Attendance를 AnonymizedAttendance로 일괄 생성
 */
export async function migrateAttendances(
  tx: any, // Prisma.TransactionClient with retention schema
  attendances: AttendanceWithRelations[],
  anonymousUserId: number,
  withdrawalDate: Date,
): Promise<number> {
  if (attendances.length === 0) {
    return 0;
  }

  const data = attendances.map((attendance) =>
    transformAttendanceToAnonymized(
      attendance,
      anonymousUserId,
      withdrawalDate,
    ),
  );

  const result = await tx.anonymizedAttendance.createMany({
    data,
    skipDuplicates: true,
  });

  return result.count;
}
