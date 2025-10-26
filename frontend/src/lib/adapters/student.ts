// Student API DTO → ViewModel 어댑터 함수들

import type {
  ClassSessionForEnrollment,
  StudentClass,
  CancellationHistory,
  EnrollmentHistory,
  AvailableSessionForEnrollment,
  TeacherProfileForStudentResponse,
} from "@/types/api/student";
import type { ClassSessionForModification } from "@/types/api/class";
import type { EnrollmentStatus } from "@/types/api/common";
import type {
  StudentCalendarSessionVM,
  EnrolledClassVM,
  ClassDataVM,
  StudentCalendarRangeVM,
  EnrollmentClassVM,
  StudentCancellationHistoryVM,
  StudentEnrollmentHistoryVM,
  StudentEnrollmentCardStatus,
  TeacherProfileDisplayVM,
  SessionContentDisplayVM,
  SessionDetailDisplayVM,
  ClassDetailDisplayVM,
  ModificationSessionVM,
} from "@/types/view/student";
import type { TeacherProfileResponse } from "@/types/api/teacher";
import type { SessionContent } from "@/types/api/session-content";
import type { ClassDetailsResponse } from "@/types/api/class";
import type { ExtendedSessionData } from "@/contexts/forms/EnrollmentFormManager";
import type { SelectedSessionVM } from "@/types/view/student";
import { getDifficultyColor, getDifficultyText } from "@/utils/difficulty";
import { formatTimeRange, formatDayOfWeek } from "@/utils/dateTime";

// 세션 데이터의 가능한 소스 타입들
type SessionDataSource =
  | ExtendedSessionData
  | AvailableSessionForEnrollment
  | SelectedSessionVM
  | Record<string, unknown>;

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
    class: {
      id: session.classId || 0,
      className: session.className,
      level: session.level || "BEGINNER",
      tuitionFee: session.tuitionFee.toString(),
      teacher: {
        id: session.teacherId || 0,
        name: session.teacherName,
      },
    },
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
function toStudentCancellationHistoryVM(
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
function toStudentEnrollmentHistoryVM(
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

// 난이도별 색상 매핑 (ConnectedCalendar와 동일)
const levelBgColor: Record<string, string> = {
  BEGINNER: "#F4E7E7",
  INTERMEDIATE: "#FBF4D8",
  ADVANCED: "#CBDFE3",
};

// AvailableSessionForEnrollment[] → EnrollmentClassVM[] (수강신청용)
export function toEnrollmentClassVMs(
  sessions: AvailableSessionForEnrollment[], // 실제 API 응답 구조에 맞춤
  academyId: number
): EnrollmentClassVM[] {
  if (!sessions || sessions.length === 0) return [];

  // 클래스별로 그룹핑
  const classMap = new Map<string, EnrollmentClassVM>();

  sessions.forEach((session) => {
    // session.class가 존재하는지 확인
    if (!session.class) {
      console.warn("Session missing class data:", session);
      return;
    }

    const className = session.class.className;
    if (!classMap.has(className)) {
      // 난이도에 따른 색상 결정
      const level = session.class.level || "BEGINNER";
      const backgroundColor = levelBgColor[level] || levelBgColor["BEGINNER"];

      classMap.set(className, {
        id: session.class.id,
        className: session.class.className,
        level: level,
        tuitionFee: session.class.tuitionFee,
        teacher: { name: session.class.teacher?.name || "선생님" },
        dayOfWeek: "MONDAY", // 기본값, 실제로는 첫 세션에서 계산
        startTime: session.startTime,
        endTime: session.endTime,
        backgroundColor: backgroundColor,
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

function toSessionContentDisplayVM(
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
  response: { sessionSummary?: string; contents: SessionContent[] } | undefined,
  isLoading: boolean,
  error: string | null
): SessionDetailDisplayVM {
  return {
    sessionId,
    sessionSummary: response?.sessionSummary,
    contents: response?.contents?.map(toSessionContentDisplayVM) || [],
    isLoading,
    error,
    hasContents: Boolean(response?.contents && response.contents.length > 0),
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

// 백엔드 API 응답 → TeacherProfileResponse (학생용)
export function toTeacherProfileForStudentVM(
  apiResponse: TeacherProfileForStudentResponse
): TeacherProfileResponse {
  return {
    id: apiResponse.id,
    userId: 0, // 백엔드에서 제공하지 않음
    name: apiResponse.name,
    phoneNumber: apiResponse.phoneNumber,
    introduction: apiResponse.introduction,
    education: apiResponse.education,
    specialties: apiResponse.specialties,
    certifications: [], // 백엔드에서 제공하지 않음
    yearsOfExperience: apiResponse.yearsOfExperience,
    availableTimes: [], // 백엔드에서 제공하지 않음
    photoUrl: apiResponse.photoUrl,
    academyId: undefined,
    academy: null,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
  };
}

// ============= 세션 어댑터들 (EnrollmentPaymentStep용) =============

/**
 * 백엔드 API 응답을 프론트엔드 컴포넌트에서 사용할 수 있는 형태로 변환
 *
 * @param sessions - 백엔드에서 받은 AvailableSessionForEnrollment 배열
 * @returns SelectedSessionVM 배열
 */
export const toSelectedSessionVMs = (
  sessions: AvailableSessionForEnrollment[]
): SelectedSessionVM[] => {
  return sessions.map((session) => ({
    // 세션 기본 정보
    id: session.id, // 세션 ID (SelectedSession의 id 필드)
    sessionId: session.id, // 원본 세션 ID 보존
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,

    // 수강 가능 여부
    isEnrollable: session.isEnrollable,
    isAlreadyEnrolled: session.isAlreadyEnrolled,
    isFull: session.isFull,
    isPastStartTime: session.isPastStartTime,

    // 학생 수강 상태
    studentEnrollmentStatus: session.studentEnrollmentStatus as
      | EnrollmentStatus
      | null
      | undefined,

    // 클래스 정보
    class: {
      id: session.class.id,
      className: session.class.className,
      level: session.class.level,
      tuitionFee: session.class.tuitionFee,
      teacher: {
        id: session.class.teacher.id,
        name: session.class.teacher.name,
      },
    },

    // 학원 정보
    academy: session.class.academy
      ? {
          id: session.class.academy.id,
          name: session.class.academy.name,
        }
      : undefined,
  }));
};

/**
 * Context에서 받은 ExtendedSessionData를 SelectedSessionVM으로 변환
 *
 * @param sessions - Context에서 받은 ExtendedSessionData 배열
 * @returns SelectedSessionVM 배열
 */
export const fromExtendedSessionDataToSelectedSessionVMs = (
  sessions: ExtendedSessionData[]
): SelectedSessionVM[] => {
  return sessions.map((session) => ({
    // 세션 기본 정보
    id: session.sessionId, // sessionId를 id로 매핑
    sessionId: session.sessionId, // 원본 sessionId 보존
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,

    // 수강 가능 여부
    isEnrollable: session.isEnrollable,
    isAlreadyEnrolled: session.isAlreadyEnrolled,

    // 클래스 정보
    class: {
      id: session.class.id,
      className: session.class.className,
      level: session.class.level,
      tuitionFee: session.class.tuitionFee,
      teacher: {
        id: session.class.teacher.id,
        name: session.class.teacher.name,
      },
    },

    // 학원 정보
    academy: session.class.academy
      ? {
          id: session.class.academy.id,
          name: session.class.academy.name,
        }
      : undefined,
  }));
};

/**
 * 세션 데이터 유효성 검증
 *
 * @param session - 검증할 세션 객체
 * @returns 유효한 세션인지 여부
 */
export const isValidSession = (
  session: unknown
): session is SelectedSessionVM => {
  if (!session || typeof session !== "object") {
    return false;
  }

  const s = session as Record<string, unknown>;

  return (
    typeof s.id === "number" &&
    typeof s.sessionId === "number" &&
    typeof s.date === "string" &&
    typeof s.startTime === "string" &&
    typeof s.endTime === "string" &&
    s.class !== null &&
    typeof s.class === "object" &&
    typeof (s.class as Record<string, unknown>).id === "number" &&
    typeof (s.class as Record<string, unknown>).className === "string"
  );
};

/**
 * 세션 배열에서 유효한 세션만 필터링
 *
 * @param sessions - 검증할 세션 배열 (다양한 소스에서 올 수 있음)
 * @returns 유효한 세션만 포함된 배열
 */
export const filterValidSessions = (
  sessions: SessionDataSource[]
): SelectedSessionVM[] => {
  return sessions.filter(isValidSession);
};

/**
 * ExtendedSessionData 배열에서 유효한 세션만 필터링
 */
export const filterValidSessionsFromContext = (
  sessions: ExtendedSessionData[]
): SelectedSessionVM[] => {
  return sessions
    .map((session) => fromExtendedSessionDataToSelectedSessionVMs([session])[0])
    .filter(isValidSession);
};

/**
 * AvailableSessionForEnrollment 배열에서 유효한 세션만 필터링
 */
export const filterValidSessionsFromAPI = (
  sessions: AvailableSessionForEnrollment[]
): SelectedSessionVM[] => {
  return sessions
    .map((session) => toSelectedSessionVMs([session])[0])
    .filter(isValidSession);
};

/**
 * 세션 ID 배열 추출
 *
 * @param sessions - SelectedSessionVM 배열
 * @returns 세션 ID 배열
 */
export const extractSessionIds = (sessions: SelectedSessionVM[]): number[] => {
  return sessions.map((session) => session.id);
};

// ============= 수강 변경 관련 어댑터들 =============

/**
 * ClassSessionForModification → ModificationSessionVM 변환
 *
 * @param session - 백엔드에서 받은 ClassSessionForModification
 * @returns ModificationSessionVM
 */
export const toModificationSessionVM = (
  session: ClassSessionForModification
): ModificationSessionVM => {
  return {
    id: session.id,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    class: {
      id: session.class?.id || 0,
      className: session.class?.className || "Unknown Class",
      level: session.class?.level || "BEGINNER",
    },
    isAlreadyEnrolled: session.isAlreadyEnrolled,
    enrollment: session.isAlreadyEnrolled
      ? {
          id: 0, // 실제 enrollment ID는 별도로 조회 필요
          status: "CONFIRMED" as const,
          enrolledAt: new Date().toISOString(),
          description: "수강 중",
        }
      : undefined,
  };
};

/**
 * ClassSessionForModification[] → ModificationSessionVM[] 변환
 *
 * @param sessions - 백엔드에서 받은 ClassSessionForModification 배열
 * @returns ModificationSessionVM 배열
 */
export const toModificationSessionVMs = (
  sessions: ClassSessionForModification[]
): ModificationSessionVM[] => {
  return sessions.map(toModificationSessionVM);
};

/**
 * 수강 변경 데이터 유효성 검증
 *
 * @param data - 검증할 수강 변경 데이터
 * @returns 유효한 데이터인지 여부
 */
export const validateModificationData = (
  data: unknown
): data is {
  cancellations: number[];
  newEnrollments: number[];
  reason?: string;
} => {
  if (!data || typeof data !== "object") {
    return false;
  }

  const d = data as Record<string, unknown>;

  return (
    Array.isArray(d.cancellations) &&
    d.cancellations.every((id: unknown) => typeof id === "number") &&
    Array.isArray(d.newEnrollments) &&
    d.newEnrollments.every((id: unknown) => typeof id === "number") &&
    (d.reason === undefined || typeof d.reason === "string")
  );
};

/**
 * ModificationSessionVM 유효성 검증
 *
 * @param session - 검증할 세션 객체
 * @returns 유효한 세션인지 여부
 */
export const isValidModificationSession = (
  session: unknown
): session is ModificationSessionVM => {
  if (!session || typeof session !== "object") {
    return false;
  }

  const s = session as Record<string, unknown>;

  return (
    typeof s.id === "number" &&
    typeof s.date === "string" &&
    typeof s.startTime === "string" &&
    typeof s.endTime === "string" &&
    s.class !== null &&
    typeof s.class === "object" &&
    typeof (s.class as Record<string, unknown>).id === "number" &&
    typeof (s.class as Record<string, unknown>).className === "string"
  );
};

/**
 * ModificationSessionVM 배열에서 유효한 세션만 필터링
 *
 * @param sessions - 검증할 세션 배열
 * @returns 유효한 세션만 포함된 배열
 */
export const filterValidModificationSessions = (
  sessions: unknown[]
): ModificationSessionVM[] => {
  return sessions.filter(isValidModificationSession);
};

/**
 * 수강 변경 세션 ID 배열 추출 (취소용)
 *
 * @param sessions - ModificationSessionVM 배열
 * @returns 취소할 세션 ID 배열
 */
export const extractCancellationSessionIds = (
  sessions: ModificationSessionVM[]
): number[] => {
  return sessions
    .filter((session) => session.isAlreadyEnrolled && session.enrollment)
    .map((session) => session.enrollment!.id);
};

/**
 * 수강 변경 세션 ID 배열 추출 (신청용)
 *
 * @param sessions - ModificationSessionVM 배열
 * @returns 신청할 세션 ID 배열
 */
export const extractNewEnrollmentSessionIds = (
  sessions: ModificationSessionVM[]
): number[] => {
  return sessions
    .filter((session) => !session.isAlreadyEnrolled)
    .map((session) => session.id);
};

/**
 * 수강 변경 세션 ID 배열 추출 (전체)
 *
 * @param sessions - ModificationSessionVM 배열
 * @returns 세션 ID 배열
 */
export const extractModificationSessionIds = (
  sessions: ModificationSessionVM[]
): number[] => {
  return sessions.map((session) => session.id);
};
