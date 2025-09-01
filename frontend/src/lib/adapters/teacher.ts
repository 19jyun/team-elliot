// Teacher API DTO → ViewModel 어댑터 함수들

import type {
  TeacherClass,
  TeacherSession,
  SessionEnrollment,
} from "@/types/api/teacher";
import type {
  BaseVM,
  TeacherClassDetailVM,
  TeacherSessionCardVM,
  SessionEnrollmentDisplayVM,
} from "@/types/view/teacher";
import {
  formatCurrency,
  getDayOfWeekText,
  getLevelText,
  getLevelColor,
  getStatusText,
  getStatusColor,
} from "@/utils/formatting";
import { formatTime } from "@/utils/dateTime";

// 날짜 포매팅 (teacher 전용)
function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

// BaseVM 생성 헬퍼
function createBaseVM(
  isLoading: boolean = false,
  error: string | null = null
): BaseVM {
  return {
    isLoading,
    error,
    isReady: !isLoading && !error,
  };
}

// ============= 클래스 관련 어댑터 함수들 =============

// TeacherSession → TeacherSessionCardVM 변환
export function toTeacherSessionCardVM(
  session: TeacherSession
): TeacherSessionCardVM {
  return {
    ...session,
    displayDate: formatDate(session.date),
    displayTime: `${formatTime(session.startTime)} - ${formatTime(
      session.endTime
    )}`,
    displayCapacity: `${session.enrollmentCount} / ${session.class.maxStudents}명`,
    levelColor: getLevelColor(session.class.level),
    isFull: session.enrollmentCount >= session.class.maxStudents,
  };
}

// TeacherClassDetailVM 생성
export function toTeacherClassDetailVM(
  classData: TeacherClass,
  isEditing: boolean = false,
  editData?: any
): TeacherClassDetailVM {
  return {
    ...createBaseVM(),
    isEditing,
    displayData: {
      className: classData.className,
      levelText: getLevelText(classData.level),
      dayOfWeekText: getDayOfWeekText(classData.dayOfWeek),
      timeRange: `${formatTime(classData.startTime)} - ${formatTime(
        classData.endTime
      )}`,
      studentCount: `${classData.currentStudents} / ${classData.maxStudents}명`,
      tuitionFee: formatCurrency(Number(classData.tuitionFee)),
      description: classData.description,
    },
    editData: editData || {
      description: classData.description || "",
      locationName: "",
      mapImageUrl: "",
      requiredItems: [],
      curriculum: [],
    },
  };
}

// ============= 세션 관련 어댑터 함수들 =============

// SessionEnrollment → SessionEnrollmentDisplayVM 변환
export function toSessionEnrollmentDisplayVM(
  enrollment: SessionEnrollment
): SessionEnrollmentDisplayVM {
  return {
    ...enrollment,
    displayStatus: getStatusText(enrollment.status),
    statusColor: getStatusColor(enrollment.status),
    displayEnrolledAt: formatDate(enrollment.enrolledAt),
    hasPayment: !!enrollment.payment,
    hasRefundRequests: !!(
      enrollment.refundRequests && enrollment.refundRequests.length > 0
    ),
  };
}
