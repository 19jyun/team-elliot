import type {
  DayOfWeek,
  EnrollmentStatus,
  ClassBase,
  ClassSessionBase,
} from "./common";

export interface TeacherProfile {
  id: number;
  name: string;
  phoneNumber: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: string[]; // any → string[]로 변경
  photoUrl?: string;
  academyId?: number;
  academy?: Academy;
  createdAt: string;
  updatedAt: string;
}

export interface Academy {
  id: number;
  name: string;
  code: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
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

// === 프로필 수정 관련 타입들 ===

export interface UpdateTeacherProfileRequest {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: string[];
}

export type UpdateTeacherProfileResponse = TeacherProfile;

// === 클래스 관련 타입들 ===

export interface TeacherClass extends ClassBase {
  dayOfWeek: DayOfWeek; // string → DayOfWeek로 변경
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  description?: string;
  backgroundColor?: string;
  // location 필드는 백엔드에 존재하지 않으므로 제거
}

export type TeacherClassesResponse = TeacherClass[];

export interface TeacherClassWithSessions extends ClassBase {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  description?: string;
  backgroundColor?: string;
  sessions?: ClassSession[];
}

export type TeacherClassesWithSessionsResponse = TeacherClassWithSessions[];

// === 세션 관련 타입들 ===

export interface ClassSession extends ClassSessionBase {
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  classId: number; // ClassSessionBase의 optional classId를 required로 오버라이드
  createdAt: string;
  updatedAt: string;
  enrollments?: SessionEnrollment[];
}

export interface TeacherSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  class: {
    id: number;
    className: string;
    maxStudents: number;
    level: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  enrollmentCount: number;
  confirmedCount: number;
}

export type TeacherSessionsResponse = TeacherSession[];

// === 수강신청 관련 타입들 ===

export interface SessionEnrollment {
  id: number;
  status: EnrollmentStatus; // 공통 타입 사용
  enrolledAt: string;
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
    level?: string;
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
      teacher: {
        id: number;
        name: string;
      };
    };
  };
  enrollments: SessionEnrollment[];
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
  status: EnrollmentStatus; // 공통 타입 사용
  reason?: string;
}

export type UpdateEnrollmentStatusResponse = SessionEnrollment;

export interface BatchUpdateEnrollmentStatusRequest {
  enrollmentIds: number[];
  status: EnrollmentStatus; // 공통 타입 사용
  reason?: string;
}

export interface BatchUpdateEnrollmentStatusResponse {
  success: number;
  total: number;
}

// === Principal 관련 타입들 ===

export interface Principal {
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

export interface TeacherDataResponse {
  userProfile: TeacherProfile;
  academy: Academy | null;
  principal: Principal | null;
  classes: TeacherClassesResponse;
  sessions: TeacherSessionsResponse;
}

// === 기존 타입들과의 호환성을 위한 별칭들 ===

export type TeacherProfileResponse = TeacherProfile;
export type UpdateProfileRequest = UpdateTeacherProfileRequest;
export type UpdateProfileResponse = UpdateTeacherProfileResponse;
