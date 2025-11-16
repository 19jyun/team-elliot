/**
 * React Query Query Key 팩토리
 *
 * 모든 Query Key를 중앙에서 관리하여:
 * 1. 타입 안전성 보장
 * 2. 캐시 무효화 시 일관성 유지
 * 3. 중복 방지
 */

// 타입 정의
export type DateRange = {
  startDate: string;
  endDate: string;
} | null;

export type EnrollmentFilters =
  | {
      status?: string;
      classId?: number;
      sessionId?: number;
    }
  | undefined;

export type RefundFilters =
  | {
      status?: string;
      classId?: number;
      sessionId?: number;
    }
  | undefined;

export type PoseDifficulty =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | undefined;

export const queryKeys = {
  // ==================== Principal ====================
  principal: {
    all: ["principal"] as const,

    profile: {
      all: ["principal", "profile"] as const,
      detail: () => [...queryKeys.principal.profile.all],
    },

    academy: {
      all: ["principal", "academy"] as const,
      detail: () => [...queryKeys.principal.academy.all],
    },

    classes: {
      all: ["principal", "classes"] as const,
      lists: () => [...queryKeys.principal.classes.all, "list"],
      list: (filters?: { status?: string }) => [
        ...queryKeys.principal.classes.lists(),
        filters,
      ],
      detail: (id: number) => [
        ...queryKeys.principal.classes.all,
        "detail",
        id,
      ],
    },

    teachers: {
      all: ["principal", "teachers"] as const,
      lists: () => [...queryKeys.principal.teachers.all, "list"],
      list: (filters?: { status?: string }) => [
        ...queryKeys.principal.teachers.lists(),
        filters,
      ],
      detail: (id: number) => [
        ...queryKeys.principal.teachers.all,
        "detail",
        id,
      ],
    },

    students: {
      all: ["principal", "students"] as const,
      lists: () => [...queryKeys.principal.students.all, "list"],
      list: (filters?: { status?: string }) => [
        ...queryKeys.principal.students.lists(),
        filters,
      ],
      detail: (id: number) => [
        ...queryKeys.principal.students.all,
        "detail",
        id,
      ],
      sessionHistory: (studentId: number) => [
        ...queryKeys.principal.students.all,
        "sessionHistory",
        studentId,
      ],
    },

    enrollments: {
      all: ["principal", "enrollments"] as const,
      lists: () => [...queryKeys.principal.enrollments.all, "list"],
      list: (filters?: EnrollmentFilters) => [
        ...queryKeys.principal.enrollments.lists(),
        filters,
      ],
      detail: (id: number) => [
        ...queryKeys.principal.enrollments.all,
        "detail",
        id,
      ],
    },

    refundRequests: {
      all: ["principal", "refundRequests"] as const,
      lists: () => [...queryKeys.principal.refundRequests.all, "list"],
      list: (filters?: RefundFilters) => [
        ...queryKeys.principal.refundRequests.lists(),
        filters,
      ],
      detail: (id: number) => [
        ...queryKeys.principal.refundRequests.all,
        "detail",
        id,
      ],
    },

    calendarSessions: {
      all: ["principal", "calendarSessions"] as const,
      lists: () => [...queryKeys.principal.calendarSessions.all, "list"],
      list: (range?: DateRange) => [
        ...queryKeys.principal.calendarSessions.lists(),
        range,
      ],
      detail: (id: number) => [
        ...queryKeys.principal.calendarSessions.all,
        "detail",
        id,
      ],
    },

    sessionEnrollments: {
      all: ["principal", "sessionEnrollments"] as const,
      detail: (sessionId: number) => [
        ...queryKeys.principal.sessionEnrollments.all,
        sessionId,
      ],
    },

    teacherJoinRequests: {
      all: ["principal", "teacherJoinRequests"] as const,
      lists: () => [...queryKeys.principal.teacherJoinRequests.all, "list"],
    },
  },

  // ==================== Student ====================
  student: {
    all: ["student"] as const,

    profile: {
      all: ["student", "profile"] as const,
      detail: () => [...queryKeys.student.profile.all],
    },

    academies: {
      all: ["student", "academies"] as const,
      lists: () => [...queryKeys.student.academies.all, "list"],
    },

    enrollmentHistory: {
      all: ["student", "enrollmentHistory"] as const,
      lists: () => [...queryKeys.student.enrollmentHistory.all, "list"],
      detail: (id: number) => [
        ...queryKeys.student.enrollmentHistory.all,
        "detail",
        id,
      ],
    },

    cancellationHistory: {
      all: ["student", "cancellationHistory"] as const,
      lists: () => [...queryKeys.student.cancellationHistory.all, "list"],
      detail: (id: number) => [
        ...queryKeys.student.cancellationHistory.all,
        "detail",
        id,
      ],
    },

    calendarSessions: {
      all: ["student", "calendarSessions"] as const,
      lists: () => [...queryKeys.student.calendarSessions.all, "list"],
      list: (range?: DateRange) => [
        ...queryKeys.student.calendarSessions.lists(),
        range,
      ],
    },

    availableSessions: {
      all: ["student", "availableSessions"] as const,
      lists: () => [...queryKeys.student.availableSessions.all, "list"],
      list: (academyId: number) => [
        ...queryKeys.student.availableSessions.lists(),
        academyId,
      ],
    },

    refundAccount: {
      all: ["student", "refundAccount"] as const,
      detail: () => [...queryKeys.student.refundAccount.all],
    },

    paymentInfo: {
      all: ["student", "paymentInfo"] as const,
      detail: (sessionId: number) => [
        ...queryKeys.student.paymentInfo.all,
        "detail",
        sessionId,
      ],
    },

    modificationSessions: {
      all: ["student", "modificationSessions"] as const,
      lists: () => [...queryKeys.student.modificationSessions.all, "list"],
      list: (classId: number) => [
        ...queryKeys.student.modificationSessions.lists(),
        classId,
      ],
    },

    teacherProfile: {
      all: ["student", "teacherProfile"] as const,
      detail: (teacherId: number) => [
        ...queryKeys.student.teacherProfile.all,
        "detail",
        teacherId,
      ],
    },
  },

  // ==================== Teacher ====================
  teacher: {
    all: ["teacher"] as const,

    profile: {
      all: ["teacher", "profile"] as const,
      detail: () => [...queryKeys.teacher.profile.all],
    },

    classes: {
      all: ["teacher", "classes"] as const,
      lists: () => [...queryKeys.teacher.classes.all, "list"],
      detail: (id: number) => [...queryKeys.teacher.classes.all, "detail", id],
    },

    calendarSessions: {
      all: ["teacher", "calendarSessions"] as const,
      lists: () => [...queryKeys.teacher.calendarSessions.all, "list"],
      list: (range?: DateRange) => [
        ...queryKeys.teacher.calendarSessions.lists(),
        range,
      ],
      detail: (id: number) => [
        ...queryKeys.teacher.calendarSessions.all,
        "detail",
        id,
      ],
    },

    sessionEnrollments: {
      all: ["teacher", "sessionEnrollments"] as const,
      lists: () => [...queryKeys.teacher.sessionEnrollments.all, "list"],
      detail: (sessionId: number) => [
        ...queryKeys.teacher.sessionEnrollments.all,
        "detail",
        sessionId,
      ],
    },

    academy: {
      all: ["teacher", "academy"] as const,
      detail: () => [...queryKeys.teacher.academy.all],
      status: () => [...queryKeys.teacher.academy.all, "status"],
    },
  },

  // ==================== Common ====================
  common: {
    all: ["common"] as const,

    balletPoses: {
      all: ["common", "balletPoses"] as const,
      lists: () => [...queryKeys.common.balletPoses.all, "list"],
      list: (difficulty?: PoseDifficulty) => [
        ...queryKeys.common.balletPoses.lists(),
        difficulty,
      ],
    },

    sessionContents: {
      all: ["common", "sessionContents"] as const,
      detail: (sessionId: number) => [
        ...queryKeys.common.sessionContents.all,
        sessionId,
      ],
    },

    classes: {
      all: ["common", "classes"] as const,
      detail: (id: number) => [...queryKeys.common.classes.all, "detail", id],
    },
  },
} as const;

// 타입 추출 헬퍼
export type QueryKey = typeof queryKeys;
