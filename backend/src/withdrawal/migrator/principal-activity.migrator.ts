import { Prisma } from '@prisma/client';
import { addFiveYears } from '../utils/date.utils';
import {
  anonymizeName,
  anonymizeAccountNumber,
} from '../anonymizer/anonymization-rules';

/**
 * Principal Activity → AnonymizedPrincipalActivity 마이그레이션
 */

// ============================================================================
// 타입 정의
// ============================================================================

export interface AcademyWithRelations {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  classes?: {
    id: number;
    classSessions?: {
      enrollments?: {
        payment?: {
          amount: Prisma.Decimal;
        } | null;
      }[];
    }[];
  }[];
  teachers?: { id: number }[];
  students?: { id: number }[];
}

export interface RefundProcessWithRelations {
  id: number;
  refundAmount: Prisma.Decimal;
  actualRefundAmount: Prisma.Decimal | null;
  status: string;
  processReason: string | null;
  processedAt: Date | null;
  sessionEnrollment: {
    id: number;
    session: {
      classId: number;
    };
  };
}

export interface RejectionWithRelations {
  id: number;
  rejectionType: string;
  entityId: number;
  entityType: string;
  reason: string;
  detailedReason: string | null;
  rejectedAt: Date;
}

export interface TeacherInfo {
  id: number;
  createdAt: Date;
}

export interface AccountInfo {
  accountHolder: string | null;
  accountNumber: string | null;
  bankName: string | null;
}

export interface PrincipalActivitiesData {
  academy: AcademyWithRelations;
  classes: any[];
  refundProcessHistory: RefundProcessWithRelations[];
  rejectionHistory: RejectionWithRelations[];
  teacherManagementHistory: TeacherInfo[];
  accountInfo: AccountInfo;
}

// ============================================================================
// 변환 함수
// ============================================================================

/**
 * Academy를 AnonymizedPrincipalActivity (ACADEMY_OPERATION) 데이터로 변환
 */
function transformAcademyToActivity(
  data: PrincipalActivitiesData,
  anonymousUserId: number,
  withdrawalDate: Date,
) {
  const academy = data.academy;

  // 총 매출 계산
  let totalRevenue = new Prisma.Decimal(0);

  academy.classes?.forEach((classData) => {
    classData.classSessions?.forEach((session) => {
      session.enrollments?.forEach((enrollment) => {
        const amount = enrollment.payment?.amount || new Prisma.Decimal(0);
        totalRevenue = totalRevenue.add(amount);
      });
    });
  });

  return {
    anonymousUserId,
    activityType: 'ACADEMY_OPERATION',

    // 학원 운영 정보
    academyId: academy.id,
    academyName: academy.name,
    academyCode: academy.code,
    operationStartDate: academy.createdAt,
    operationEndDate: withdrawalDate,
    totalClasses: academy.classes?.length || 0,
    totalTeachers: academy.teachers?.length || 0,
    totalStudents: academy.students?.length || 0,
    totalRevenue,

    // 은행 계좌 정보 (익명화)
    accountHolderMasked: data.accountInfo.accountHolder
      ? anonymizeName(data.accountInfo.accountHolder)
      : null,
    accountNumberMasked: data.accountInfo.accountNumber
      ? anonymizeAccountNumber(data.accountInfo.accountNumber)
      : null,
    bankName: data.accountInfo.bankName,

    // 환불/거절 처리 정보 (null)
    processedEntityType: null,
    processedEntityId: null,
    processAction: null,
    processReason: null,
    processedAmount: null,
    processedAt: null,

    // 강사 관리 정보 (null)
    managedTeacherId: null,
    managementAction: null,
    managedAt: null,

    dataRetentionUntil: addFiveYears(withdrawalDate),
  };
}

/**
 * RefundRequest를 AnonymizedPrincipalActivity (REFUND_PROCESS) 데이터로 변환
 */
function transformRefundToActivity(
  refund: RefundProcessWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
) {
  return {
    anonymousUserId,
    activityType: 'REFUND_PROCESS',

    // 학원 운영 정보 (null)
    academyId: null,
    academyName: null,
    academyCode: null,
    operationStartDate: null,
    operationEndDate: null,
    totalClasses: null,
    totalTeachers: null,
    totalStudents: null,
    totalRevenue: null,

    // 은행 계좌 정보 (null)
    accountHolderMasked: null,
    accountNumberMasked: null,
    bankName: null,

    // 환불 처리 정보
    processedEntityType: 'REFUND_REQUEST',
    processedEntityId: refund.id,
    processAction: refund.status,
    processReason: refund.processReason,
    processedAmount: refund.actualRefundAmount || refund.refundAmount,
    processedAt: refund.processedAt,

    // 강사 관리 정보 (null)
    managedTeacherId: null,
    managementAction: null,
    managedAt: null,

    dataRetentionUntil: addFiveYears(withdrawalDate),
  };
}

/**
 * RejectionDetail을 AnonymizedPrincipalActivity (ENROLLMENT_REJECTION) 데이터로 변환
 */
function transformRejectionToActivity(
  rejection: RejectionWithRelations,
  anonymousUserId: number,
  withdrawalDate: Date,
) {
  return {
    anonymousUserId,
    activityType: 'ENROLLMENT_REJECTION',

    // 학원 운영 정보 (null)
    academyId: null,
    academyName: null,
    academyCode: null,
    operationStartDate: null,
    operationEndDate: null,
    totalClasses: null,
    totalTeachers: null,
    totalStudents: null,
    totalRevenue: null,

    // 은행 계좌 정보 (null)
    accountHolderMasked: null,
    accountNumberMasked: null,
    bankName: null,

    // 거절 처리 정보
    processedEntityType: rejection.entityType,
    processedEntityId: rejection.entityId,
    processAction: 'REJECTED',
    processReason: rejection.detailedReason || rejection.reason,
    processedAmount: null,
    processedAt: rejection.rejectedAt,

    // 강사 관리 정보 (null)
    managedTeacherId: null,
    managementAction: null,
    managedAt: null,

    dataRetentionUntil: addFiveYears(withdrawalDate),
  };
}

/**
 * Teacher 관리를 AnonymizedPrincipalActivity (TEACHER_MANAGEMENT) 데이터로 변환
 */
function transformTeacherManagementToActivity(
  teacher: TeacherInfo,
  anonymousUserId: number,
  withdrawalDate: Date,
) {
  return {
    anonymousUserId,
    activityType: 'TEACHER_MANAGEMENT',

    // 학원 운영 정보 (null)
    academyId: null,
    academyName: null,
    academyCode: null,
    operationStartDate: null,
    operationEndDate: null,
    totalClasses: null,
    totalTeachers: null,
    totalStudents: null,
    totalRevenue: null,

    // 은행 계좌 정보 (null)
    accountHolderMasked: null,
    accountNumberMasked: null,
    bankName: null,

    // 환불/거절 처리 정보 (null)
    processedEntityType: null,
    processedEntityId: null,
    processAction: null,
    processReason: null,
    processedAmount: null,
    processedAt: null,

    // 강사 관리 정보
    managedTeacherId: teacher.id,
    managementAction: 'TEACHER_ADDED',
    managedAt: teacher.createdAt,

    dataRetentionUntil: addFiveYears(withdrawalDate),
  };
}

// ============================================================================
// 마이그레이션 함수
// ============================================================================

/**
 * Principal 활동 내역을 AnonymizedPrincipalActivity로 일괄 생성
 */
export async function migratePrincipalActivities(
  tx: any, // Prisma.TransactionClient with retention schema
  activitiesData: PrincipalActivitiesData,
  anonymousUserId: number,
  withdrawalDate: Date,
): Promise<number> {
  const activities: any[] = [];

  // 1. 학원 운영 내역
  activities.push(
    transformAcademyToActivity(activitiesData, anonymousUserId, withdrawalDate),
  );

  // 2. 환불 처리 내역
  for (const refund of activitiesData.refundProcessHistory) {
    activities.push(
      transformRefundToActivity(refund, anonymousUserId, withdrawalDate),
    );
  }

  // 3. 거절 처리 내역
  for (const rejection of activitiesData.rejectionHistory) {
    activities.push(
      transformRejectionToActivity(rejection, anonymousUserId, withdrawalDate),
    );
  }

  // 4. 강사 관리 내역
  for (const teacher of activitiesData.teacherManagementHistory) {
    activities.push(
      transformTeacherManagementToActivity(
        teacher,
        anonymousUserId,
        withdrawalDate,
      ),
    );
  }

  if (activities.length === 0) {
    return 0;
  }

  const result = await tx.anonymizedPrincipalActivity.createMany({
    data: activities,
    skipDuplicates: true,
  });

  return result.count;
}
