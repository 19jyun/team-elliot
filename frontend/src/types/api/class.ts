import type {
  DayOfWeek,
  EnrollmentStatus,
  ClassBase,
  ClassSessionBase,
  TeacherRef,
} from "./common";

export interface Class extends ClassBase {
  classCode: string;
  description: string;
  maxStudents: number;
  currentStudents: number;
  teacherId: number;
  academyId: number;
  dayOfWeek: DayOfWeek; // string → DayOfWeek로 변경
  startTime: string;
  endTime: string;
  status: string;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  teacher: TeacherRef & { photoUrl: string };
  academy: {
    id: number;
    name: string;
  };
}

export interface ClassSession extends ClassSessionBase {
  currentStudents?: number;
  maxStudents?: number;
  isEnrollable?: boolean;
  isFull?: boolean;
  isPastStartTime?: boolean;
  isAlreadyEnrolled?: boolean;
  studentEnrollmentStatus?: EnrollmentStatus | null; // string → EnrollmentStatus로 변경
  class?: {
    id: number;
    className: string;
    level: string;
    tuitionFee: string;
    teacher?: {
      id: number;
      name: string;
    };
  };
  enrollments?: SessionEnrollment[];
}

export interface SessionEnrollment {
  id: number;
  studentId: number;
  sessionId: number;
  status: EnrollmentStatus; // 공통 타입 사용
  enrolledAt: string;
  cancelledAt?: string;
}

export interface ClassDetailsResponse extends Class {
  classDetail?: {
    id: number;
    description: string;
    locationName: string;
    mapImageUrl: string;
    requiredItems: string[];
    curriculum: string[];
  };
}

export interface CreateClassResponse {
  id: number;
  className: string;
  classCode: string;
  description: string;
  maxStudents: number;
  currentStudents: number;
  tuitionFee: string;
  teacherId: number;
  academyId: number;
  dayOfWeek: DayOfWeek; // string → DayOfWeek로 변경
  startTime: string;
  endTime: string;
  level: string;
  status: string;
  startDate: string;
  endDate: string;
  backgroundColor: string | null;
  classDetailId: number | null;
  sessionCount: number;
  message: string;
}

export interface EnrollClassResponse {
  success: boolean;
  message: string;
}

export interface UnenrollClassResponse {
  success: boolean;
  message: string;
}

export interface ClassesWithSessionsByMonthResponse {
  id: number;
  className: string;
  teacher: {
    id: number;
    name: string;
    photoUrl: string;
  };
  dayOfWeek: DayOfWeek; // string → DayOfWeek로 변경
  startTime: string;
  endTime: string;
  level: string;
  backgroundColor: string;
  academyId: number;
  sessions: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    currentStudents: number;
    maxStudents: number;
    isEnrollable: boolean;
    isFull: boolean;
    isPastStartTime: boolean;
    isAlreadyEnrolled: boolean;
    studentEnrollmentStatus: EnrollmentStatus | null; // string → EnrollmentStatus로 변경
  }[];
}

// 새로운 enrollment/modification 모드용 응답 타입
export interface GetClassSessionsForEnrollmentResponse {
  sessions: ClassSession[];
  calendarRange: {
    startDate: string;
    endDate: string;
  } | null;
}

export interface ClassSessionForModification extends ClassSession {
  isSelectable: boolean; // 수강 변경 가능
  canBeCancelled: boolean; // 환불 신청 가능
  isModifiable: boolean; // 전체 수정 가능 여부
  isPastStartTime: boolean;
  isFull: boolean;
  isAlreadyEnrolled: boolean;
}

export interface GetClassSessionsForModificationResponse {
  sessions: ClassSessionForModification[];
  calendarRange: {
    startDate: string;
    endDate: string;
  } | null;
}

// ============= 확장된 세션 타입들 =============

// enrollmentCount와 confirmedCount가 포함된 세션 타입 (Teacher/Principal API 응답용)
export interface ClassSessionWithCounts extends ClassSession {
  enrollmentCount: number;
  confirmedCount: number;
  sessionSummary?: string | null;
}
