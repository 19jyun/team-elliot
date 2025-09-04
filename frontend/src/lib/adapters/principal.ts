// Principal API DTO → ViewModel 어댑터 함수들

import type {
  PrincipalProfile,
  PrincipalAcademy,
  PrincipalClass,
  PrincipalTeacher,
  PrincipalStudent,
  PrincipalClassSession,
  PrincipalEnrollment,
  PrincipalRefundRequest,
  UpdatePrincipalProfileRequest,
} from "@/types/api/principal";
import type { ClassSession } from "@/types/api/class";
import { formatDate, formatTime, formatTimeRange } from "@/utils/dateTime";
import type {
  PrincipalCalendarSessionVM,
  PrincipalClassCardVM,
  PrincipalClassListVM,
  PrincipalTeacherCardVM,
  PrincipalTeacherListVM,
  PrincipalStudentCardVM,
  PrincipalStudentListVM,
  PrincipalSessionDetailModalVM,
  PrincipalClassSessionModalVM,
  PrincipalAcademyVM,
  PrincipalProfileVM,
  PrincipalEnrollmentRequestVM,
  PrincipalRefundRequestVM,
  PrincipalRequestDetailVM,
  PrincipalPersonalInfoManagementVM,
  PrincipalClassListForRequestsVM,
  PrincipalClassData,
  PrincipalSessionListForRequestsVM,
  PrincipalSessionData,
  PrincipalStudentSessionHistoryModalVM,
  PrincipalStudentSessionHistoryItem,
  PrincipalDashboardStatsVM,
  PrincipalRejectionFormModalVM,
  PrincipalDateSessionModalVM,
  PrincipalRequestCardVM,
  PrincipalProfileCardVM,
  PrincipalSessionDetailModalPropsVM,
  PrincipalDateSessionModalPropsVM,
} from "@/types/view/principal";

// ============= 공통 유틸리티 함수들 =============

// 날짜 포맷팅 (기본 형식)
const formatDateDisplay = (dateString: string): string => {
  try {
    return formatDate(dateString, { includeYear: true, format: "long" });
  } catch {
    return "날짜 없음";
  }
};

// 시간 포맷팅 (기본 형식)
const formatTimeDisplay = (timeString: string): string => {
  try {
    return formatTime(timeString);
  } catch {
    return timeString;
  }
};

// 시간 범위 포맷팅
const formatTimeRangeDisplay = (startTime: string, endTime: string): string => {
  try {
    return formatTimeRange(startTime, endTime);
  } catch {
    return `${startTime} - ${endTime}`;
  }
};

// 레벨별 색상 (Principal 전용)
const getPrincipalLevelColor = (level: string): string => {
  switch (level) {
    case "BEGINNER":
      return "bg-green-100 text-green-800";
    case "INTERMEDIATE":
      return "bg-yellow-100 text-yellow-800";
    case "ADVANCED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 상태별 색상 (Principal 전용)
const getPrincipalStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// ============= 캘린더 관련 어댑터 함수들 =============

// PrincipalClassSession → PrincipalCalendarSessionVM 변환
export function toPrincipalCalendarSessionVM(
  session: PrincipalClassSession
): PrincipalCalendarSessionVM {
  return {
    ...session,
    displayDate: formatDateDisplay(session.date),
    displayTime: formatTimeRangeDisplay(session.startTime, session.endTime),
    displayCapacity: `${session.currentStudents} / ${session.maxStudents}명`,
    levelColor: getPrincipalLevelColor("BEGINNER"), // 기본값, 실제로는 class에서 가져와야 함
    isFull: session.currentStudents >= session.maxStudents,
    canManage: true, // Principal은 항상 관리 가능
  };
}

// Principal calendarSessions → ClassSession 변환 (CalendarProvider용)
export function toClassSessionForCalendar(
  session: PrincipalClassSession
): ClassSession {
  return {
    id: session.id,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    classId: session.classId,
    class: {
      id: session.classId,
      className: "클래스", // 기본값, 실제로는 class에서 가져와야 함
      level: "BEGINNER", // 기본값
      tuitionFee: "0", // 기본값
      teacher: { id: 0, name: "선생님" }, // 기본값
    },
    currentStudents: session.currentStudents,
    maxStudents: session.maxStudents,
    isEnrollable: true,
    isFull: session.currentStudents >= session.maxStudents,
    isPastStartTime:
      new Date(session.date + "T" + session.startTime) < new Date(),
    isAlreadyEnrolled: false, // Principal view에서는 해당 없음
    studentEnrollmentStatus: null, // Principal view에서는 해당 없음
    enrollments: (session.enrollments || []).map((enrollment) => ({
      id: enrollment.id,
      sessionId: session.id,
      studentId: enrollment.studentId,
      status: enrollment.status as any, // 타입 호환성을 위해 임시 any 사용
      enrolledAt: enrollment.enrolledAt,
    })),
  };
}

// ============= 클래스 관련 어댑터 함수들 =============

// PrincipalClass → PrincipalClassCardVM 변환
export function toPrincipalClassCardVM(
  classData: PrincipalClass
): PrincipalClassCardVM {
  return {
    ...classData,
    displaySchedule: `${classData.dayOfWeek} ${formatTimeRangeDisplay(
      classData.startTime,
      classData.endTime
    )}`,
    displayCapacity: `${classData.maxStudents}명`,
    levelColor: getPrincipalLevelColor(classData.level),
    isRegistrationOpen: classData.status === "ACTIVE",
    canManage: true, // Principal은 항상 관리 가능
  };
}

// PrincipalClass[] → PrincipalClassListVM 변환
export function toPrincipalClassListVM(
  classes: PrincipalClass[],
  isLoading: boolean = false,
  error: string | null = null
): PrincipalClassListVM {
  const classCardVMs = classes.map(toPrincipalClassCardVM);
  const activeCount = classCardVMs.filter((c) => c.isRegistrationOpen).length;
  const inactiveCount = classCardVMs.length - activeCount;

  return {
    classes: classCardVMs,
    totalCount: classes.length,
    activeCount,
    inactiveCount,
    isLoading,
    error,
  };
}

// ============= 선생님 관련 어댑터 함수들 =============

// PrincipalTeacher → PrincipalTeacherCardVM 변환
export function toPrincipalTeacherCardVM(
  teacher: PrincipalTeacher
): PrincipalTeacherCardVM {
  return {
    ...teacher,
    displayJoinedAt: formatDateDisplay(new Date().toISOString()), // 기본값, 실제로는 joinedAt에서 가져와야 함
    displayExperience: "경력 정보 없음", // 기본값, 실제로는 yearsOfExperience에서 가져와야 함
    statusColor: getPrincipalStatusColor("ACTIVE"), // 기본값
    canManage: true, // Principal은 항상 관리 가능
  };
}

// PrincipalTeacher[] → PrincipalTeacherListVM 변환
export function toPrincipalTeacherListVM(
  teachers: PrincipalTeacher[],
  isLoading: boolean = false,
  error: string | null = null
): PrincipalTeacherListVM {
  const teacherCardVMs = teachers.map(toPrincipalTeacherCardVM);

  return {
    teachers: teacherCardVMs,
    totalCount: teachers.length,
    activeCount: teachers.length, // 기본값, 실제로는 상태에 따라 계산해야 함
    isLoading,
    error,
  };
}

// ============= 수강생 관련 어댑터 함수들 =============

// PrincipalStudent → PrincipalStudentCardVM 변환
export function toPrincipalStudentCardVM(
  student: PrincipalStudent
): PrincipalStudentCardVM {
  return {
    ...student,
    displayJoinedAt: formatDateDisplay(new Date().toISOString()), // 기본값, 실제로는 joinedAt에서 가져와야 함
    displayLevel: "레벨 정보 없음", // 기본값, 실제로는 level에서 가져와야 함
    statusColor: getPrincipalStatusColor("ACTIVE"), // 기본값
    canManage: true, // Principal은 항상 관리 가능
  };
}

// PrincipalStudent[] → PrincipalStudentListVM 변환
export function toPrincipalStudentListVM(
  students: PrincipalStudent[],
  isLoading: boolean = false,
  error: string | null = null
): PrincipalStudentListVM {
  const studentCardVMs = students.map(toPrincipalStudentCardVM);

  return {
    students: studentCardVMs,
    totalCount: students.length,
    activeCount: students.length, // 기본값, 실제로는 상태에 따라 계산해야 함
    isLoading,
    error,
  };
}

// ============= 세션 상세 관련 어댑터 함수들 =============

// Principal 세션 상세 모달 ViewModel 생성
export function toPrincipalSessionDetailModalVM({
  isOpen,
  session,
  onClose,
}: {
  isOpen: boolean;
  session: PrincipalClassSession | null;
  onClose: () => void;
}): PrincipalSessionDetailModalVM {
  return {
    isOpen,
    session: session ? toPrincipalCalendarSessionVM(session) : null,
    onClose,
  };
}

// Principal 클래스 세션 모달 ViewModel 생성
export function toPrincipalClassSessionModalVM({
  isOpen,
  selectedClass,
  onClose,
}: {
  isOpen: boolean;
  selectedClass: PrincipalClass | null;
  onClose: () => void;
}): PrincipalClassSessionModalVM {
  return {
    isOpen,
    selectedClass: selectedClass ? toPrincipalClassCardVM(selectedClass) : null,
    onClose,
  };
}

// ============= 학원 관리 관련 어댑터 함수들 =============

// PrincipalAcademy → PrincipalAcademyVM 변환
export function toPrincipalAcademyVM(
  academy: PrincipalAcademy
): PrincipalAcademyVM {
  return {
    ...academy,
    displayCreatedAt: formatDateDisplay(academy.createdAt),
    displayUpdatedAt: formatDateDisplay(academy.updatedAt),
    canEdit: true, // Principal은 항상 편집 가능
  };
}

// PrincipalProfile → PrincipalProfileVM 변환
export function toPrincipalProfileVM(
  profile: PrincipalProfile
): PrincipalProfileVM {
  return {
    ...profile,
    displayJoinedAt: formatDateDisplay(profile.createdAt),
    canEdit: true, // Principal은 항상 편집 가능
  };
}

// ============= 수강신청/환불 관리 관련 어댑터 함수들 =============

// PrincipalEnrollment → PrincipalEnrollmentRequestVM 변환
export function toPrincipalEnrollmentRequestVM(
  enrollment: PrincipalEnrollment
): PrincipalEnrollmentRequestVM {
  return {
    id: enrollment.id,
    studentId: enrollment.studentId,
    studentName: enrollment.session.class.teacher.name, // 기본값, 실제로는 student에서 가져와야 함
    studentPhoneNumber: undefined, // 기본값
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    reason: undefined, // 기본값
    // 세션 정보
    sessionDate: enrollment.session?.date,
    sessionStartTime: enrollment.session?.startTime,
    sessionEndTime: enrollment.session?.endTime,
    className: enrollment.session?.class?.className,
    classLevel: enrollment.session?.class?.level,
    teacherName: enrollment.session?.class?.teacher?.name,
    // UI 표시용 계산된 필드들
    displayEnrolledAt: formatDateDisplay(enrollment.enrolledAt),
    displaySessionDate: enrollment.session?.date
      ? formatDateDisplay(enrollment.session.date)
      : undefined,
    displaySessionTime:
      enrollment.session?.startTime && enrollment.session?.endTime
        ? `${formatTimeDisplay(
            enrollment.session.startTime
          )} - ${formatTimeDisplay(enrollment.session.endTime)}`
        : undefined,
    statusColor: getPrincipalStatusColor(enrollment.status),
    canApprove: enrollment.status === "PENDING",
    canReject: enrollment.status === "PENDING",
  };
}

// PrincipalRefundRequest → PrincipalRefundRequestVM 변환
export function toPrincipalRefundRequestVM(
  refundRequest: PrincipalRefundRequest
): PrincipalRefundRequestVM {
  return {
    id: refundRequest.id,
    studentId: refundRequest.studentId,
    studentName: refundRequest.sessionEnrollment.session.class.teacher.name, // 기본값, 실제로는 student에서 가져와야 함
    studentPhoneNumber: undefined, // 기본값
    reason: refundRequest.reason,
    detailedReason: undefined, // 기본값
    refundAmount: refundRequest.refundAmount,
    status: refundRequest.status,
    requestedAt: refundRequest.requestedAt,
    bankName: refundRequest.bankName,
    accountNumber: refundRequest.accountNumber,
    accountHolder: refundRequest.accountHolder,
    // 세션 정보
    sessionDate: refundRequest.sessionEnrollment?.session?.date,
    sessionStartTime: refundRequest.sessionEnrollment?.session?.startTime,
    sessionEndTime: refundRequest.sessionEnrollment?.session?.endTime,
    className: refundRequest.sessionEnrollment?.session?.class?.className,
    classLevel: refundRequest.sessionEnrollment?.session?.class?.level,
    teacherName: refundRequest.sessionEnrollment?.session?.class?.teacher?.name,
    // UI 표시용 계산된 필드들
    displayRequestedAt: formatDateDisplay(refundRequest.requestedAt),
    displayRefundAmount: `${refundRequest.refundAmount.toLocaleString()}원`,
    displaySessionDate: refundRequest.sessionEnrollment?.session?.date
      ? formatDateDisplay(refundRequest.sessionEnrollment.session.date)
      : undefined,
    displaySessionTime:
      refundRequest.sessionEnrollment?.session?.startTime &&
      refundRequest.sessionEnrollment?.session?.endTime
        ? `${formatTimeDisplay(
            refundRequest.sessionEnrollment.session.startTime
          )} - ${formatTimeDisplay(
            refundRequest.sessionEnrollment.session.endTime
          )}`
        : undefined,
    statusColor: getPrincipalStatusColor(refundRequest.status),
    canApprove: refundRequest.status === "PENDING",
    canReject: refundRequest.status === "PENDING",
  };
}

// ============= 대시보드 관련 어댑터 함수들 =============

// Principal 대시보드 통계 ViewModel 생성
export function toPrincipalDashboardStatsVM({
  totalClasses,
  totalTeachers,
  totalStudents,
  totalSessions,
  activeClasses,
  pendingEnrollments,
  pendingRefunds,
}: {
  totalClasses: number;
  totalTeachers: number;
  totalStudents: number;
  totalSessions: number;
  activeClasses: number;
  pendingEnrollments: number;
  pendingRefunds: number;
}): PrincipalDashboardStatsVM {
  return {
    totalClasses,
    totalTeachers,
    totalStudents,
    totalSessions,
    activeClasses,
    pendingEnrollments,
    pendingRefunds,
    displayStats: {
      classes: `${totalClasses}개`,
      teachers: `${totalTeachers}명`,
      students: `${totalStudents}명`,
      sessions: `${totalSessions}개`,
    },
    statusColors: {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
    },
  };
}

// ============= 모달 관련 어댑터 함수들 =============

// Principal 거절 폼 모달 ViewModel 생성
export function toPrincipalRejectionFormModalVM({
  isOpen,
  requestType,
  requestId,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  requestType: "enrollment" | "refund";
  requestId: number;
  onClose: () => void;
  onSubmit: (reason: string, detailedReason?: string) => void;
}): PrincipalRejectionFormModalVM {
  return {
    isOpen,
    requestType,
    requestId,
    onClose,
    onSubmit,
  };
}

// Principal 날짜 세션 모달 ViewModel 생성
export function toPrincipalDateSessionModalVM({
  isOpen,
  selectedDate,
  sessions,
  onClose,
  onSessionClick,
}: {
  isOpen: boolean;
  selectedDate: Date | null;
  sessions: PrincipalClassSession[];
  onClose: () => void;
  onSessionClick: (session: PrincipalCalendarSessionVM) => void;
}): PrincipalDateSessionModalVM {
  return {
    isOpen,
    selectedDate,
    sessions: sessions.map(toPrincipalCalendarSessionVM),
    onClose,
    onSessionClick,
  };
}

// ============= 추가 어답터 함수들 =============

// Principal 요청 카드 Props ViewModel 생성
export function toPrincipalRequestCardVM({
  request,
  requestType,
  onApprove,
  onReject,
  isProcessing = false,
}: {
  request: PrincipalEnrollment | PrincipalRefundRequest;
  requestType: "enrollment" | "refund";
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isProcessing?: boolean;
}): PrincipalRequestCardVM {
  const requestVM =
    requestType === "enrollment"
      ? toPrincipalEnrollmentRequestVM(request as PrincipalEnrollment)
      : toPrincipalRefundRequestVM(request as PrincipalRefundRequest);

  return {
    request: requestVM,
    requestType,
    onApprove,
    onReject,
    isProcessing,
  };
}

// Principal 프로필 카드 Props ViewModel 생성
export function toPrincipalProfileCardVM({
  principalId,
  isEditable = true,
  onSave,
  onCancel,
  showHeader = true,
  compact = false,
}: {
  principalId?: number;
  isEditable?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
  compact?: boolean;
}): PrincipalProfileCardVM {
  return {
    principalId,
    isEditable,
    onSave,
    onCancel,
    showHeader,
    compact,
  };
}

// Principal 세션 상세 모달 Props ViewModel 생성
export function toPrincipalSessionDetailModalPropsVM({
  isOpen,
  sessionId,
  onClose,
}: {
  isOpen: boolean;
  sessionId: number | null;
  onClose: () => void;
}): PrincipalSessionDetailModalPropsVM {
  return {
    isOpen,
    sessionId,
    onClose,
    role: "principal",
  };
}

// Principal 날짜 세션 모달 Props ViewModel 생성
export function toPrincipalDateSessionModalPropsVM({
  isOpen,
  selectedDate,
  onClose,
  onSessionClick,
}: {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSessionClick: (session: PrincipalCalendarSessionVM) => void;
}): PrincipalDateSessionModalPropsVM {
  return {
    isOpen,
    selectedDate,
    onClose,
    onSessionClick,
    role: "principal",
  };
}

// Principal 요청 상세 ViewModel 생성
export function toPrincipalRequestDetailVM({
  requests,
  selectedTab,
  selectedSessionId,
  isLoading,
  error,
  isProcessing,
  showRejectionModal,
  selectedRequest,
}: {
  requests: (PrincipalEnrollment | PrincipalRefundRequest)[];
  selectedTab: "enrollment" | "refund";
  selectedSessionId: number | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  showRejectionModal: boolean;
  selectedRequest: { id: number } | null;
}): PrincipalRequestDetailVM {
  return {
    requests,
    selectedTab,
    selectedSessionId,
    isLoading,
    error,
    isProcessing,
    showRejectionModal,
    selectedRequest,
    // UI 표시용 계산된 필드들
    hasRequests: requests.length > 0,
    requestCount: requests.length,
    emptyMessage:
      selectedTab === "enrollment"
        ? "수강 신청이 없습니다."
        : "환불 요청이 없습니다.",
  };
}

// Principal 개인정보 관리 ViewModel 생성
export function toPrincipalPersonalInfoManagementVM({
  profile,
  isEditing,
  editedInfo,
  isLoading,
  error,
  isPrincipal,
  isPhoneVerificationRequired,
  isPhoneVerified,
  verificationCode,
  timeLeft,
  isTimerRunning,
  validationErrors,
  isShaking,
}: {
  profile: PrincipalProfile | null;
  isEditing: boolean;
  editedInfo: UpdatePrincipalProfileRequest;
  isLoading: boolean;
  error: string | null;
  isPrincipal: boolean;
  isPhoneVerificationRequired: boolean;
  isPhoneVerified: boolean;
  verificationCode: string;
  timeLeft: number;
  isTimerRunning: boolean;
  validationErrors: Record<string, string>;
  isShaking: boolean;
}): PrincipalPersonalInfoManagementVM {
  return {
    profile,
    isEditing,
    editedInfo,
    isLoading,
    error,
    isPrincipal,
    isPhoneVerificationRequired,
    isPhoneVerified,
    verificationCode,
    timeLeft,
    isTimerRunning,
    validationErrors,
    isShaking,
    // UI 표시용 계산된 필드들
    isInitialLoading: !profile && isPrincipal && !error,
    canSave: !isLoading && (!isPhoneVerificationRequired || isPhoneVerified),
    phoneDisplayValue: profile?.phoneNumber || "전화번호가 없습니다.",
    academyDisplayValue: profile?.academy?.name || "소속 학원이 없습니다.",
  };
}

// Principal 클래스 목록 ViewModel 생성 (수강신청/환불 관리용)
export function toPrincipalClassListForRequestsVM({
  enrollments,
  refundRequests,
  selectedTab,
  isLoading,
  error,
}: {
  enrollments: PrincipalEnrollment[];
  refundRequests: PrincipalRefundRequest[];
  selectedTab: "enrollment" | "refund";
  isLoading: boolean;
  error: string | null;
}): PrincipalClassListForRequestsVM {
  // 클래스별로 그룹화
  const classMap = new Map<number, PrincipalClassData>();

  if (selectedTab === "enrollment") {
    // 수강신청 데이터 처리
    const pendingEnrollments = enrollments.filter(
      (enrollment) => enrollment.status === "PENDING"
    );

    pendingEnrollments.forEach((enrollment) => {
      const classId = enrollment.session?.class?.id;
      const className = enrollment.session?.class?.className;
      const teacherName = enrollment.session?.class?.teacher?.name;
      const level = enrollment.session?.class?.level || "BEGINNER";

      if (!classId) {
        console.warn("Enrollment without classId:", enrollment);
        return;
      }

      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: classId,
          name: className || `클래스 ${classId}`,
          pendingCount: 0,
          sessions: [],
          teacherName: teacherName || "미지정",
          level,
        });
      }

      const classData = classMap.get(classId)!;
      classData.pendingCount++;
      classData.sessions.push(enrollment);
    });
  } else {
    // 환불신청 데이터 처리
    const pendingRefunds = refundRequests.filter(
      (refund) => refund.status === "PENDING"
    );

    pendingRefunds.forEach((refund) => {
      const classId = refund.sessionEnrollment?.session?.class?.id;
      const className = refund.sessionEnrollment?.session?.class?.className;
      const teacherName =
        refund.sessionEnrollment?.session?.class?.teacher?.name;
      const level =
        refund.sessionEnrollment?.session?.class?.level || "BEGINNER";

      if (!classId) {
        console.warn("Refund without classId:", refund);
        return;
      }

      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: classId,
          name: className || `클래스 ${classId}`,
          pendingCount: 0,
          sessions: [],
          teacherName: teacherName || "미지정",
          level,
        });
      }

      const classData = classMap.get(classId)!;
      classData.pendingCount++;
      classData.sessions.push(refund);
    });
  }

  const classes = Array.from(classMap.values()).filter(
    (classData) => classData.id
  );

  return {
    classes,
    selectedTab,
    isLoading,
    error,
    // UI 표시용 계산된 필드들
    hasClasses: classes.length > 0,
    emptyMessage:
      selectedTab === "enrollment"
        ? "수강 신청이 대기 중인 클래스가 없습니다."
        : "환불 요청이 대기 중인 클래스가 없습니다.",
  };
}

// Principal 세션 목록 ViewModel 생성 (수강신청/환불 관리용)
export function toPrincipalSessionListForRequestsVM({
  enrollments,
  refundRequests,
  selectedTab,
  selectedClassId,
  isLoading,
  error,
}: {
  enrollments: PrincipalEnrollment[];
  refundRequests: PrincipalRefundRequest[];
  selectedTab: "enrollment" | "refund";
  selectedClassId: number | null;
  isLoading: boolean;
  error: string | null;
}): PrincipalSessionListForRequestsVM {
  // 선택된 클래스의 세션만 필터링하고 세션별로 그룹화
  const sessionMap = new Map<number, PrincipalSessionData>();

  if (selectedTab === "enrollment") {
    // 수강신청 데이터 처리
    const pendingEnrollments = enrollments.filter((enrollment) => {
      const classId = enrollment.session?.class?.id;
      return enrollment.status === "PENDING" && classId === selectedClassId;
    });

    pendingEnrollments.forEach((enrollment) => {
      const sessionId = enrollment.sessionId;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId,
          className: enrollment.session?.class?.className || "클래스명 없음",
          date: enrollment.session?.date || "",
          startTime: enrollment.session?.startTime || "",
          endTime: enrollment.session?.endTime || "",
          level: enrollment.session?.class?.level || "BEGINNER",
          teacherName: enrollment.session?.class?.teacher?.name || "미지정",
          currentStudents: 0,
          maxStudents: 0,
          pendingCount: 0,
          enrollments: [],
        });
      }
      const session = sessionMap.get(sessionId)!;
      session.pendingCount++;
      session.enrollments!.push(enrollment);
    });
  } else {
    // 환불신청 데이터 처리
    const pendingRefunds = refundRequests.filter((refund) => {
      const classId = refund.sessionEnrollment?.session?.class?.id;
      return refund.status === "PENDING" && classId === selectedClassId;
    });

    pendingRefunds.forEach((refund) => {
      const sessionId = refund.sessionEnrollment?.session?.id;
      if (!sessionId) return;

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId,
          className:
            refund.sessionEnrollment?.session?.class?.className ||
            "클래스명 없음",
          date: refund.sessionEnrollment?.session?.date || "",
          startTime: refund.sessionEnrollment?.session?.startTime || "",
          endTime: refund.sessionEnrollment?.session?.endTime || "",
          level: refund.sessionEnrollment?.session?.class?.level || "BEGINNER",
          teacherName:
            refund.sessionEnrollment?.session?.class?.teacher?.name || "미지정",
          currentStudents: 0,
          maxStudents: 0,
          pendingCount: 0,
          refundRequests: [],
        });
      }
      const session = sessionMap.get(sessionId)!;
      session.pendingCount++;
      session.refundRequests!.push(refund);
    });
  }

  const sessions = Array.from(sessionMap.values());

  return {
    sessions,
    selectedTab,
    selectedClassId,
    isLoading,
    error,
    // UI 표시용 계산된 필드들
    hasSessions: sessions.length > 0,
    emptyMessage:
      selectedTab === "enrollment"
        ? "수강 신청이 대기 중인 세션이 없습니다."
        : "환불 요청이 대기 중인 세션이 없습니다.",
    showClassSelectionMessage: !selectedClassId,
  };
}

// Principal 학생 세션 히스토리 모달 ViewModel 생성
export function toPrincipalStudentSessionHistoryModalVM({
  student,
  history,
  isLoading,
  error,
}: {
  student: { id: number; name: string };
  history: PrincipalStudentSessionHistoryItem[];
  isLoading: boolean;
  error: string | null;
}): PrincipalStudentSessionHistoryModalVM {
  return {
    student,
    history,
    isLoading,
    error,
    // UI 표시용 계산된 필드들
    hasHistory: history.length > 0,
    emptyMessage: "수강 기록이 없습니다.",
  };
}
