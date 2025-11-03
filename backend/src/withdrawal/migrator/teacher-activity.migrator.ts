import { Prisma } from '@prisma/client';
import { addFiveYears } from '../utils/date.utils';

/**
 * Teacher Activity → AnonymizedTeacherActivity 마이그레이션
 */

// ============================================================================
// 타입 정의
// ============================================================================

export interface ClassWithRelations {
  id: number;
  className: string;
  academyId: number;
  tuitionFee: Prisma.Decimal;
  startDate: Date;
  endDate: Date;
  classSessions?: {
    id: number;
    enrollments?: {
      id: number;
      payment?: {
        amount: Prisma.Decimal;
      } | null;
    }[];
  }[];
}

export interface TeacherActivitiesData {
  classes: ClassWithRelations[];
}

// ============================================================================
// 변환 함수
// ============================================================================

/**
 * Class를 AnonymizedTeacherActivity (CLASS_OPERATION) 데이터로 변환
 */
function transformClassToActivity(
  classData: ClassWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
) {
  // 총 수강 신청 수 및 매출 계산
  let totalEnrollments = 0;
  let totalRevenue = new Prisma.Decimal(0);

  classData.classSessions?.forEach((session) => {
    session.enrollments?.forEach((enrollment) => {
      totalEnrollments++;
      const amount = enrollment.payment?.amount || new Prisma.Decimal(0);
      totalRevenue = totalRevenue.add(amount);
    });
  });

  return {
    anonymousUserId,
    activityType: 'CLASS_OPERATION',

    // 수업 운영 정보
    classId: classData.id,
    className: classData.className,
    academyId: classData.academyId,
    tuitionFee: classData.tuitionFee,
    operationStartDate: classData.startDate,
    operationEndDate: classData.endDate,
    totalSessions: classData.classSessions?.length || 0,
    totalEnrollments,
    totalRevenue,

    dataRetentionUntil: addFiveYears(withdrawalDate),
  };
}

// ============================================================================
// 마이그레이션 함수
// ============================================================================

/**
 * Teacher 활동 내역을 AnonymizedTeacherActivity로 일괄 생성
 * (CLASS_OPERATION만 기록)
 */
export async function migrateTeacherActivities(
  tx: any, // Prisma.TransactionClient with retention schema
  activitiesData: TeacherActivitiesData,
  anonymousUserId: number,
  withdrawalDate: Date,
): Promise<number> {
  if (activitiesData.classes.length === 0) {
    return 0;
  }

  const activities = activitiesData.classes.map((classData) =>
    transformClassToActivity(classData, anonymousUserId, withdrawalDate),
  );

  const result = await tx.anonymizedTeacherActivity.createMany({
    data: activities,
    skipDuplicates: true,
  });

  return result.count;
}
