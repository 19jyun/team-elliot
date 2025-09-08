// Teacher API DTO → ViewModel 어댑터 함수들

import type {
  TeacherClass,
  TeacherSession,
  TeacherSessionEnrollment,
} from "@/types/api/teacher";
import type { ClassSession } from "@/types/api/class";
import type {
  BaseVM,
  TeacherClassDetailVM,
  TeacherSessionCardVM,
  SessionEnrollmentDisplayVM,
  TeacherCalendarSessionVM,
  TeacherClassListVM,
  TeacherClassCardVM,
  TeacherSessionDetailModalVM,
  TeacherClassSessionModalVM,
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
  editData?: unknown
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
    editData: {
      description:
        editData &&
        typeof editData === "object" &&
        "description" in editData &&
        typeof editData.description === "string"
          ? editData.description
          : classData.description || "",
      locationName:
        editData &&
        typeof editData === "object" &&
        "locationName" in editData &&
        typeof editData.locationName === "string"
          ? editData.locationName
          : "",
      mapImageUrl:
        editData &&
        typeof editData === "object" &&
        "mapImageUrl" in editData &&
        typeof editData.mapImageUrl === "string"
          ? editData.mapImageUrl
          : "",
      requiredItems:
        editData &&
        typeof editData === "object" &&
        "requiredItems" in editData &&
        Array.isArray(editData.requiredItems)
          ? editData.requiredItems
          : [],
      curriculum:
        editData &&
        typeof editData === "object" &&
        "curriculum" in editData &&
        Array.isArray(editData.curriculum)
          ? editData.curriculum
          : [],
    },
  };
}

// ============= 세션 관련 어댑터 함수들 =============

// TeacherSessionEnrollment → SessionEnrollmentDisplayVM 변환
export function toSessionEnrollmentDisplayVM(
  enrollment: TeacherSessionEnrollment
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

// ============= 대시보드 관련 어댑터 함수들 =============

// TeacherSession → TeacherCalendarSessionVM 변환
export function toTeacherCalendarSessionVM(
  session: TeacherSession
): TeacherCalendarSessionVM {
  return {
    ...session,
    displayDate: formatDate(session.date),
    displayTime: `${formatTime(session.startTime)} - ${formatTime(
      session.endTime
    )}`,
    displayCapacity: `${session.enrollmentCount} / ${session.class.maxStudents}명`,
    levelColor: getLevelColor(session.class.level),
    isFull: session.enrollmentCount >= session.class.maxStudents,
    canManage: true, // 선생님은 항상 관리 가능
  };
}

// Teacher calendarSessions → ClassSession 변환 (CalendarProvider용)
export function toClassSessionForCalendar(
  session: TeacherSession
): ClassSession {
  return {
    id: session.id,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    classId: session.class.id,
    class: {
      id: session.class.id,
      className: session.class.className,
      level: session.class.level,
      tuitionFee: "0", // Teacher view에서는 tuitionFee 정보가 없으므로 기본값
      teacher: session.class.teacher,
    },
    currentStudents: session.enrollmentCount,
    maxStudents: session.class.maxStudents,
    isEnrollable: true,
    isFull: session.enrollmentCount >= session.class.maxStudents,
    isPastStartTime:
      new Date(session.date + "T" + session.startTime) < new Date(),
    isAlreadyEnrolled: false, // Teacher view에서는 해당 없음
    studentEnrollmentStatus: null, // Teacher view에서는 해당 없음
    enrollments: [],
  };
}

// TeacherClass → TeacherClassCardVM 변환
export function toTeacherClassCardVM(
  classData: TeacherClass
): TeacherClassCardVM {
  return {
    id: classData.id,
    className: classData.className,
    level: classData.level,
    dayOfWeek: classData.dayOfWeek,
    startTime: classData.startTime,
    endTime: classData.endTime,
    maxStudents: classData.maxStudents,
    currentStudents: classData.currentStudents,
    tuitionFee: Number(classData.tuitionFee),
    description: classData.description,
    // UI 표시용 계산된 필드들
    displayLevel: getLevelText(classData.level),
    displayDayOfWeek: getDayOfWeekText(classData.dayOfWeek),
    displayTimeRange: `${formatTime(classData.startTime)} - ${formatTime(
      classData.endTime
    )}`,
    displayStudentCount: `${classData.currentStudents} / ${classData.maxStudents}명`,
    displayTuitionFee: formatCurrency(Number(classData.tuitionFee)),
    levelColor: getLevelColor(classData.level),
    isFull: classData.currentStudents >= classData.maxStudents,
    canManage: true, // 선생님은 항상 관리 가능
  };
}

// TeacherClass[] → TeacherClassListVM 변환
export function toTeacherClassListVM(
  classes: TeacherClass[],
  isLoading: boolean = false,
  error: string | null = null
): TeacherClassListVM {
  return {
    ...createBaseVM(isLoading, error),
    classes: classes.map(toTeacherClassCardVM),
    hasClasses: classes.length > 0,
    totalClasses: classes.length,
  };
}

// ============= 모달 Props 어댑터들 =============

// Teacher 세션 상세 모달 Props → ViewModel 변환
export function toTeacherSessionDetailModalVM(props: {
  isOpen: boolean;
  session: TeacherCalendarSessionVM | null;
  onClose: () => void;
}): TeacherSessionDetailModalVM {
  return {
    isOpen: props.isOpen,
    session: props.session,
    onClose: props.onClose,
  };
}

// Teacher 클래스 세션 모달 Props → ViewModel 변환
export function toTeacherClassSessionModalVM(props: {
  isOpen: boolean;
  selectedClass: TeacherClassCardVM | null;
  onClose: () => void;
}): TeacherClassSessionModalVM {
  return {
    isOpen: props.isOpen,
    selectedClass: props.selectedClass,
    onClose: props.onClose,
  };
}
