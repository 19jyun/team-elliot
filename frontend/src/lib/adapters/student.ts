// Student API DTO → ViewModel 어댑터 함수들

import type {
  ClassSessionForEnrollment,
  StudentClass,
  CancellationHistory,
  EnrollmentHistory,
  AvailableSessionForEnrollment,
} from "@/types/api/student";
import type {
  StudentCalendarSessionVM,
  EnrolledClassVM,
  StudentSessionVM,
  ClassDataVM,
  SessionDataVM,
  StudentCalendarRangeVM,
  EnrollmentClassVM,
  StudentCancellationHistoryVM,
  StudentEnrollmentHistoryVM,
  StudentEnrollmentCardStatus,
  StudentSessionDetailModalVM,
  LeaveAcademyModalVM,
  ClassSessionModalVM,
  EnrolledClassCardVM,
  SessionCardVM,
  EnrollmentModificationDateStepVM,
  EnrollmentPaymentStepVM,
  BankInfoVM,
  PrincipalPaymentBoxVM,
  ModificationSessionVM,
  StudentEnrolledSessionVM,
  TeacherProfileDisplayVM,
  SessionContentDisplayVM,
  SessionDetailDisplayVM,
  ClassDetailDisplayVM,
} from "@/types/view/student";
import type { TeacherProfileResponse } from "@/types/api/teacher";
import type { SessionContent } from "@/types/api/session-content";
import type { ClassDetailsResponse } from "@/types/api/class";
import { getDifficultyColor, getDifficultyText } from "@/utils/difficulty";
import {
  formatTimeRange,
  formatDateDisplay,
  formatDayOfWeek,
} from "@/utils/dateTime";

// 숫자 포매팅 (천 단위 콤마)
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

// 세션 상태 결정
function getSessionStatus(session: ClassSessionForEnrollment): {
  status: StudentSessionVM["status"];
  statusText: string;
  statusColor: StudentSessionVM["statusColor"];
  canEnroll: boolean;
  canCancel: boolean;
} {
  const isPast = new Date(session.date + " " + session.startTime) < new Date();
  const isFull = session.currentEnrollments >= session.maxStudents;

  if (isPast) {
    return {
      status: "past",
      statusText: "종료",
      statusColor: "gray",
      canEnroll: false,
      canCancel: false,
    };
  }

  if (session.isEnrolled) {
    return {
      status: "enrolled",
      statusText: "수강중",
      statusColor: "green",
      canEnroll: false,
      canCancel: true,
    };
  }

  if (isFull) {
    return {
      status: "full",
      statusText: "마감",
      statusColor: "red",
      canEnroll: false,
      canCancel: false,
    };
  }

  return {
    status: "available",
    statusText: "신청가능",
    statusColor: "blue",
    canEnroll: true,
    canCancel: false,
  };
}

// ClassSessionForEnrollment → StudentCalendarSessionVM
export function toStudentCalendarSessionVM(
  session: ClassSessionForEnrollment
): StudentCalendarSessionVM {
  const isFull = session.currentEnrollments >= session.maxStudents;
  const isPast = new Date(session.date + " " + session.startTime) < new Date();

  let statusColor: StudentCalendarSessionVM["statusColor"] = "blue";
  if (isPast) statusColor = "gray";
  else if (session.isEnrolled) statusColor = "green";
  else if (isFull) statusColor = "red";

  return {
    id: session.id,
    title: `${session.className} (${session.teacherName})`,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    timeDisplay: formatTimeRange(session.startTime, session.endTime),
    isFull,
    isEnrolled: session.isEnrolled,
    canEnroll: !session.isEnrolled && !isFull && !isPast,
    statusColor,
    capacityText: `${session.currentEnrollments}/${session.maxStudents}명`,
  };
}

// ClassSessionForEnrollment → StudentSessionVM
export function toStudentSessionVM(
  session: ClassSessionForEnrollment
): StudentSessionVM {
  const statusInfo = getSessionStatus(session);

  return {
    id: session.id,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    title: session.className,
    teacher: session.teacherName,
    datetime: `${formatDateDisplay(session.date)} ${formatTimeRange(
      session.startTime,
      session.endTime
    )}`,
    timeDisplay: formatTimeRange(session.startTime, session.endTime),
    ...statusInfo,
    capacityText: `${session.currentEnrollments}/${session.maxStudents}명`,
  };
}

// StudentClass → ClassDataVM (ClassSessionModal용)
export function toClassDataVM(studentClass: StudentClass): ClassDataVM {
  return {
    id: studentClass.id,
    className: studentClass.name,
    dayOfWeek: formatDayOfWeek(studentClass.dayOfWeek),
    startTime: studentClass.startTime,
    teacher: {
      id: 0, // StudentClass에는 teacher.id가 없으므로 기본값
      name: studentClass.teacherName,
    },
  };
}

// ClassSessionForEnrollment → SessionDataVM (SessionDetailModal용)
export function toSessionDataVM(
  session: ClassSessionForEnrollment
): SessionDataVM {
  return {
    id: session.id,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    class: {
      id: session.id, // 임시로 session.id 사용
      className: session.className,
      level: "BEGINNER", // 기본값 (API에 없음)
      tuitionFee: formatCurrency(session.tuitionFee),
      teacher: {
        id: 0, // 기본값 (API에 없음)
        name: session.teacherName,
      },
    },
    isEnrolled: session.isEnrolled,
    canEnroll:
      !session.isEnrolled && session.currentEnrollments < session.maxStudents,
  };
}

// ClassSessionForEnrollment[] → EnrolledClassVM[] (클래스별 그룹핑)
export function toEnrolledClassVMs(
  sessions: ClassSessionForEnrollment[]
): EnrolledClassVM[] {
  const classMap = new Map<string, EnrolledClassVM>();

  sessions.forEach((session) => {
    const className = session.className;
    if (!classMap.has(className)) {
      classMap.set(className, {
        id: session.id, // 임시로 session.id 사용
        name: session.className,
        level: "BEGINNER", // 기본값
        tuitionFee: session.tuitionFee,
        teacherName: session.teacherName,
        dayOfWeek: "MONDAY", // 기본값 (API에 없음)
        startTime: session.startTime,
        endTime: session.endTime,
        location: "온라인", // 기본값
        sessions: [],
      });
    }

    const enrolledClass = classMap.get(className)!;
    // StudentEnrolledSessionVM 형태로 적재
    enrolledClass.sessions.push({
      session_id: session.id,
      enrollment_id: session.enrollmentId,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      enrollment_status:
        (session.enrollmentStatus as StudentEnrollmentCardStatus) ||
        (session.isEnrolled ? "CONFIRMED" : "PENDING"),
      class: {
        id: session.id,
        className: session.className,
        level: "BEGINNER",
      },
    });
  });

  return Array.from(classMap.values());
}

// CancellationHistory → StudentCancellationHistoryVM
export function toStudentCancellationHistoryVM(
  cancellation: CancellationHistory
): StudentCancellationHistoryVM {
  return {
    id: cancellation.id,
    status: cancellation.status,
    className: cancellation.className,
    sessionDate: cancellation.sessionDate,
    cancelledAt: cancellation.cancelledAt || cancellation.requestedAt,
    reason: cancellation.reason,
    sessionId: cancellation.sessionId,
    refundAmount: cancellation.refundAmount,
    requestedAt: cancellation.requestedAt,
    rejectionDetail: cancellation.rejectionDetail,
    isOptimistic: cancellation.isOptimistic,
  };
}

// CancellationHistory[] → StudentCancellationHistoryVM[]
export function toStudentCancellationHistoryVMs(
  cancellations: CancellationHistory[]
): StudentCancellationHistoryVM[] {
  return cancellations.map(toStudentCancellationHistoryVM);
}

// EnrollmentHistory → StudentEnrollmentHistoryVM
export function toStudentEnrollmentHistoryVM(
  enrollment: EnrollmentHistory
): StudentEnrollmentHistoryVM {
  return {
    id: enrollment.id,
    sessionId: enrollment.sessionId,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    description: enrollment.description,
    session: enrollment.session,
    enrollmentRejection: enrollment.enrollmentRejection,
    refundRejection: enrollment.refundRejection,
    isOptimistic: enrollment.isOptimistic,
  };
}

// EnrollmentHistory[] → StudentEnrollmentHistoryVM[]
export function toStudentEnrollmentHistoryVMs(
  enrollments: EnrollmentHistory[]
): StudentEnrollmentHistoryVM[] {
  return enrollments.map(toStudentEnrollmentHistoryVM);
}

// 캘린더 날짜 범위 변환
export function toStudentCalendarRangeVM(range: {
  startDate: string;
  endDate: string;
}): StudentCalendarRangeVM {
  return {
    startDate: new Date(range.startDate),
    endDate: new Date(range.endDate),
  };
}

// AvailableSessionForEnrollment[] → EnrollmentClassVM[] (수강신청용)
export function toEnrollmentClassVMs(
  sessions: AvailableSessionForEnrollment[], // 실제 API 응답 구조에 맞춤
  academyId: number
): EnrollmentClassVM[] {
  if (!sessions || sessions.length === 0) return [];

  // 클래스별로 그룹핑
  const classMap = new Map<string, EnrollmentClassVM>();

  sessions.forEach((session) => {
    const className = session.class.className;
    if (!classMap.has(className)) {
      classMap.set(className, {
        id: session.id,
        className: session.class.className,
        level: "BEGINNER", // 기본값
        tuitionFee: session.class.tuitionFee,
        teacher: { name: session.class.teacher.name || "선생님" },
        dayOfWeek: "MONDAY", // 기본값, 실제로는 첫 세션에서 계산
        startTime: session.startTime,
        endTime: session.endTime,
        backgroundColor: undefined, // 기본값
        sessionCount: 0,
        academyId,
        availableSessions: [],
      });
    }

    const enrollmentClass = classMap.get(className)!;
    enrollmentClass.availableSessions.push({
      id: session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
    });
    enrollmentClass.sessionCount = enrollmentClass.availableSessions.length;
  });

  return Array.from(classMap.values());
}

// ============= Props ViewModel 어댑터들 =============

// Modal Props 어댑터들
export function toStudentSessionDetailModalVM(props: {
  isOpen: boolean;
  session: StudentEnrolledSessionVM | null;
  onClose: () => void;
  onlyDetail?: boolean;
}): StudentSessionDetailModalVM {
  return {
    isOpen: props.isOpen,
    session: props.session,
    onClose: props.onClose,
    onlyDetail: props.onlyDetail,
  };
}

export function toLeaveAcademyModalVM(props: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  academyName: string;
}): LeaveAcademyModalVM {
  return {
    isOpen: props.isOpen,
    onClose: props.onClose,
    onConfirm: props.onConfirm,
    academyName: props.academyName,
  };
}

export function toClassSessionModalVM(props: {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassDataVM | null;
  classSessions: StudentEnrolledSessionVM[];
}): ClassSessionModalVM {
  return {
    isOpen: props.isOpen,
    onClose: props.onClose,
    classData: props.classData,
    classSessions: props.classSessions,
  };
}

// Component Props 어댑터들
export function toEnrolledClassCardVM(
  enrolledClass: EnrolledClassVM,
  onClick?: () => void
): EnrolledClassCardVM {
  return {
    ...enrolledClass,
    onClick,
  };
}

export function toSessionCardVM(
  session: StudentEnrolledSessionVM,
  callbacks?: {
    onEnroll?: () => void;
    onCancel?: () => void;
    onClick?: () => void;
  }
): SessionCardVM {
  // 세션 상태에 따른 표시 텍스트와 색상 결정
  const getSessionDisplayInfo = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return {
          statusText: "수강중",
          statusColor: "green" as const,
          status: "enrolled" as const,
        };
      case "PENDING":
        return {
          statusText: "승인대기",
          statusColor: "blue" as const,
          status: "available" as const,
        };
      default:
        return {
          statusText: "상태불명",
          statusColor: "gray" as const,
          status: "past" as const,
        };
    }
  };

  const displayInfo = getSessionDisplayInfo(session.enrollment_status);

  return {
    sessionId: session.session_id,
    title: session.class.className,
    teacher: session.class.className, // 임시로 클래스명 사용
    datetime: `${session.date} ${session.startTime}-${session.endTime}`,
    status: displayInfo.status,
    statusText: displayInfo.statusText,
    statusColor: displayInfo.statusColor,
    onEnroll: callbacks?.onEnroll,
    onCancel: callbacks?.onCancel,
    onClick: callbacks?.onClick,
  };
}

// Step Props 어댑터들
export function toEnrollmentModificationDateStepVM(props: {
  classId: number;
  existingEnrollments: ModificationSessionVM[];
  month?: number | null;
  onComplete: (selectedDates: string[], sessionPrice?: number) => void;
}): EnrollmentModificationDateStepVM {
  return {
    classId: props.classId,
    existingEnrollments: props.existingEnrollments,
    month: props.month,
    onComplete: props.onComplete,
  };
}

export function toEnrollmentPaymentStepVM(props: {
  onComplete?: () => void;
}): EnrollmentPaymentStepVM {
  return {
    onComplete: props.onComplete,
  };
}

// Payment Props 어댑터들
export function toBankInfoVM(bankInfo: {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}): BankInfoVM {
  return {
    bankName: bankInfo.bankName,
    accountNumber: bankInfo.accountNumber,
    accountHolder: bankInfo.accountHolder,
  };
}

export function toPrincipalPaymentBoxVM(props: {
  principal: {
    name: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  amount: number;
}): PrincipalPaymentBoxVM {
  return {
    principal: props.principal,
    amount: props.amount,
  };
}

// ============= TeacherProfileCardForStudent 어댑터 =============

export function toTeacherProfileDisplayVM(
  profile: TeacherProfileResponse | null,
  isLoading: boolean,
  error: string | null
): TeacherProfileDisplayVM {
  if (!profile) {
    return {
      id: 0,
      name: "",
      displayName: "",
      displayPhotoUrl: "",
      displayPhoneNumber: "",
      displayIntroduction: "",
      displayYearsOfExperience: "",
      hasEducation: false,
      hasSpecialties: false,
      isLoading,
      error,
    };
  }

  return {
    id: profile.id,
    name: profile.name,
    photoUrl: profile.photoUrl,
    phoneNumber: profile.phoneNumber,
    introduction: profile.introduction,
    yearsOfExperience: profile.yearsOfExperience,
    education: profile.education,
    specialties: profile.specialties,
    // UI 표시용 계산된 필드들
    displayName: profile.name || "이름 없음",
    displayPhotoUrl: profile.photoUrl || "",
    displayPhoneNumber: profile.phoneNumber || "",
    displayIntroduction: profile.introduction || "",
    displayYearsOfExperience: profile.yearsOfExperience
      ? `${profile.yearsOfExperience}년`
      : "",
    hasEducation: Boolean(profile.education && profile.education.length > 0),
    hasSpecialties: Boolean(
      profile.specialties && profile.specialties.length > 0
    ),
    isLoading,
    error,
  };
}

// ============= SessionDetailTab 어댑터 =============

export function toSessionContentDisplayVM(
  content: SessionContent
): SessionContentDisplayVM {
  return {
    id: content.id,
    pose: {
      id: content.pose.id,
      name: content.pose.name,
      description: content.pose.description,
      imageUrl: content.pose.imageUrl,
      difficulty: content.pose.difficulty,
      displayDifficulty: getDifficultyText(content.pose.difficulty),
      difficultyColor: getDifficultyColor(content.pose.difficulty),
    },
    notes: content.notes,
    hasNotes: Boolean(content.notes),
    hasImage: Boolean(content.pose.imageUrl),
  };
}

export function toSessionDetailDisplayVM(
  sessionId: number,
  contents: SessionContent[] | undefined,
  isLoading: boolean,
  error: string | null
): SessionDetailDisplayVM {
  return {
    sessionId,
    contents: contents?.map(toSessionContentDisplayVM) || [],
    isLoading,
    error,
    hasContents: Boolean(contents && contents.length > 0),
  };
}

// ============= ClassDetail 어댑터 =============

export function toClassDetailDisplayVM(
  classId: number,
  classDetails: ClassDetailsResponse | null,
  isLoading: boolean,
  error: string | null,
  showModificationButton: boolean = true
): ClassDetailDisplayVM {
  if (!classDetails) {
    return {
      classId,
      className: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      description: "",
      teacher: null,
      hasTeacher: false,
      showModificationButton,
      isLoading,
      error,
    };
  }

  return {
    classId,
    className: classDetails.className || "",
    dayOfWeek: formatDayOfWeek(classDetails.dayOfWeek || ""),
    startTime: classDetails.startTime || "",
    endTime: classDetails.endTime || "",
    description:
      classDetails.classDetail?.description ||
      classDetails.description ||
      "클래스 설명이 없습니다.",
    teacher: classDetails.teacher
      ? {
          id: classDetails.teacherId || 0,
          name: classDetails.teacher.name || "",
        }
      : null,
    hasTeacher: Boolean(classDetails.teacher),
    showModificationButton,
    isLoading,
    error,
  };
}
