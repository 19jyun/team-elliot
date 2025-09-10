// Student API DTO → ViewModel 어댑터 함수들

import type {
  ClassSessionForEnrollment,
  StudentClass,
  CancellationHistory,
  EnrollmentHistory,
  AvailableSessionForEnrollment,
  TeacherProfileForStudentResponse,
} from "@/types/api/student";
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
} from "@/types/view/student";
import type { TeacherProfileResponse } from "@/types/api/teacher";
import type { SessionContent } from "@/types/api/session-content";
import type { ClassDetailsResponse } from "@/types/api/class";
import { getDifficultyColor, getDifficultyText } from "@/utils/difficulty";
import { formatTimeRange, formatDayOfWeek } from "@/utils/dateTime";

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
