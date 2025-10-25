import type {
  DayOfWeek,
  EnrollmentStatus,
  ClassBase,
  TeacherRef,
  SessionCore,
  Academy,
  AcademySummary,
} from "./common";
import type { SessionEnrollment } from "./class";

// SessionEnrollment을 re-export;

// === Teacher Profile 관련 타입들 ===

interface TeacherProfile {
  id: number;
  userId: number;
  name: string;
  phoneNumber: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: string[]; // any에서 string[]로 변경
  photoUrl?: string;
  academyId?: number;
  academy?: AcademySummary | null;
  createdAt: string;
  updatedAt: string;
}

// === 학원 가입 요청 관련 타입들 ===

export interface RequestJoinAcademyRequest {
  code: string;
  message?: string;
}

export interface RequestJoinAcademyResponse {
  message: string;
  request: {
    id: number;
    teacherId: number;
    academyId: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    message?: string;
    createdAt: string;
    updatedAt: string;
    academy: {
      id: number;
      name: string;
      code: string;
    };
  };
}

// === 학원 변경 관련 타입들 ===

export interface ChangeAcademyRequest {
  code: string;
}

export interface ChangeAcademyResponse {
  success: boolean;
  message: string;
  academyId?: number;
}

export interface LeaveAcademyResponse {
  success: boolean;
  message: string;
}

// === 학원 가입 상태 관련 타입들 ===

export interface TeacherAcademyStatusResponse {
  status: "NOT_JOINED" | "JOINED" | "PENDING";
  academy?: {
    id: number;
    name: string;
    code: string;
    phoneNumber: string;
    address: string;
    description: string;
  };
  joinRequest?: {
    id: number;
    academyId: number;
    academyName: string;
    message?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
  };
}

// === 프로필 수정 관련 타입들 ===

export interface UpdateTeacherProfileRequest {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: string[]; // any에서 string[]로 변경
}

export type UpdateTeacherProfileResponse = TeacherProfile;

// === 클래스 관련 타입들 ===

export interface TeacherClass extends ClassBase {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  description?: string;
  backgroundColor?: string;
  enrollments?: ClassEnrollment[];
}

export type TeacherClassesResponse = TeacherClass[];

interface TeacherClassWithSessions extends ClassBase {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  description?: string;
  backgroundColor?: string;
  classSessions: unknown[]; // ClassSession은 class.ts에서 정의됨
}

// 백엔드 getTeacherClassesWithSessions 응답 구조에 맞춰 수정
export interface TeacherClassesWithSessionsResponse {
  classes: TeacherClassWithSessions[];
  sessions: TeacherSession[];
  calendarRange: {
    startDate: string;
    endDate: string;
  };
}

// === 세션 관련 타입들 ===

// ClassSession은 class.ts에서 정의됨

export interface TeacherSession extends SessionCore {
  class: {
    id: number;
    className: string;
    maxStudents: number;
    level: string;
    teacher: TeacherRef;
  };
  enrollmentCount: number;
  confirmedCount: number;
  sessionSummary?: string | null;
}

// === 수강신청 관련 타입들 ===

interface ClassEnrollment {
  id: number;
  student: {
    id: number;
    name: string;
  };
}

// SessionEnrollment은 class.ts에서 import됨
// Teacher/Principal용 확장된 SessionEnrollment 타입
export interface TeacherSessionEnrollment extends SessionEnrollment {
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paidAt?: string;
  };
  refundRequests?: Array<{
    id: number;
    reason: string;
    refundAmount: number;
    status: string;
    requestedAt: string;
  }>;
}

export interface SessionEnrollmentsResponse {
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      teacher: TeacherRef;
    };
  };
  enrollments: TeacherSessionEnrollment[];
  totalCount: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    absent: number;
    completed: number;
  };
}

export interface UpdateEnrollmentStatusRequest {
  status: EnrollmentStatus;
  reason?: string;
}

export type UpdateEnrollmentStatusResponse = TeacherSessionEnrollment;

export interface BatchUpdateEnrollmentStatusRequest {
  enrollmentIds: number[];
  status: EnrollmentStatus;
  reason?: string;
}

export interface BatchUpdateEnrollmentStatusResponse {
  success: number;
  total: number;
}

// === Principal 관련 타입들 ===

interface Principal {
  id: number;
  userId: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  introduction?: string;
  photoUrl?: string;
  education: string[];
  certifications: string[];
  yearsOfExperience?: number;
  academyId: number;
  createdAt: string;
  updatedAt: string;
}

// === TeacherData 초기화용 API Response ===

// 백엔드 getTeacherData에서 반환하는 Academy 타입 (include로 많은 관계 포함)
interface TeacherDataAcademy extends Academy {
  principal?: Principal;
  teachers?: TeacherProfile[];
  classes?: TeacherClassWithSessions[];
  students?: Array<{
    id: number;
    name: string;
    phoneNumber?: string;
  }>;
}

export interface TeacherDataResponse {
  userProfile: TeacherProfile;
  academy: TeacherDataAcademy | null;
  principal: Principal | null;
  classes: TeacherClassesWithSessionsResponse;
  sessions: unknown[]; // ClassSession은 class.ts에서 정의됨
  enrollments: Array<
    TeacherSessionEnrollment & {
      session: {
        id: number;
        date: string;
        startTime: string;
        endTime: string;
        class: ClassBase & {
          teacher: TeacherRef;
        };
      };
    }
  >;
}

// === 기존 타입들과의 호환성을 위한 별칭들 ===

export type TeacherProfileResponse = TeacherProfile;
export type UpdateProfileRequest = UpdateTeacherProfileRequest;

// === 클래스 상세 정보 수정 관련 타입들 ===

export interface UpdateClassDetailsRequest {
  description?: string;
  locationName?: string;
  mapImageUrl?: string;
  requiredItems?: string[];
  curriculum?: string[];
}

export interface UpdateClassDetailsResponse {
  id: number;
  className: string;
  classDetail: {
    id: number;
    description: string;
    locationName: string;
    mapImageUrl: string;
    requiredItems: string[];
    curriculum: string[];
    teacherId: number;
    createdAt: string;
    updatedAt: string;
  };
}

// === 세션 요약 관련 타입들 ===

export interface UpdateSessionSummaryRequest {
  sessionSummary: string;
}

export interface UpdateSessionSummaryResponse {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  sessionSummary: string | null;
  class: {
    id: number;
    className: string;
    level: string;
    maxStudents: number;
  };
  contents: Array<{
    id: number;
    sessionId: number;
    poseId: number;
    order: number;
    pose: {
      id: number;
      name: string;
      description?: string;
      difficulty: string;
      imageUrl?: string;
    };
  }>;
  enrollments: Array<{
    id: number;
    studentId: number;
    sessionId: number;
    status: string;
    enrolledAt: string;
    student: {
      id: number;
      name: string;
      phoneNumber: string;
    };
  }>;
}
