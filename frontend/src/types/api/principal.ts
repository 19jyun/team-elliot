// Principal 전용 API 타입들
import type { DayOfWeek, ClassBase, TeacherRef } from "./common";
import type {
  DeleteSessionContentResponse,
  ReorderSessionContentsRequest,
  ReorderSessionContentsResponse,
  SessionContentResponse,
  UpdateSessionContentRequest,
  UpdateSessionContentResponse,
} from "./session-content";

// Principal의 학원 정보
export interface PrincipalAcademy {
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

// Principal의 학원 클래스 정보
export interface PrincipalClass extends ClassBase {
  classCode: string; // 백엔드에서 제공
  description?: string;
  maxStudents: number;
  tuitionFee: number; // 백엔드에서 제공
  teacherId: number; // 백엔드에서 제공
  academyId: number; // 백엔드에서 제공
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  level: string; // 백엔드에서 제공
  status: string; // 백엔드에서 제공
  startDate: string;
  endDate: string;
  backgroundColor?: string;
  location?: string;
  teacher: TeacherRef & {
    phoneNumber?: string;
    introduction?: string; // 백엔드에서 제공
    photoUrl?: string; // 백엔드에서 제공
  };
  academy: {
    // 백엔드에서 제공
    id: number;
    name: string;
  };
  classSessions: PrincipalClassSession[]; // 백엔드에서 제공
  // currentStudents, isRegistrationOpen, createdAt, updatedAt는 백엔드에서 제공되지 않음
}

// Principal 클래스 세션 정보 (백엔드 응답 구조에 맞춤)
export interface PrincipalClassSession {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  currentStudents: number;
  maxStudents: number;
  enrollments: PrincipalSessionEnrollment[];
}

// Principal 세션 수강신청 정보 (백엔드 응답 구조에 맞춤)
interface PrincipalSessionEnrollment {
  id: number;
  studentId: number;
  sessionId: number;
  status: string;
  enrolledAt: string;
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
}

// Principal의 학원 선생님 정보
export interface PrincipalTeacher {
  id: number;
  name: string;
  phoneNumber?: string;
  introduction?: string;
  photoUrl?: string;
  // education, specialties, certifications, yearsOfExperience, joinedAt, totalClasses, activeClasses는 백엔드에서 제공되지 않음
}

// Principal의 학원 수강생 정보
export interface PrincipalStudent {
  id: number;
  name: string;
  phoneNumber?: string;
  // emergencyContact, birthDate, notes, level, joinedAt, totalSessions, confirmedSessions, pendingSessions, totalClasses, activeClasses는 백엔드에서 제공되지 않음
}

// Principal의 학원 정보 수정 요청 타입
export interface UpdatePrincipalAcademyRequest {
  name?: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
}

// Principal의 프로필 정보 타입
export interface PrincipalProfile {
  id: number;
  userId: number; // 백엔드에서 제공
  name: string;
  email: string; // 백엔드에서 제공
  phoneNumber: string;
  introduction?: string;
  photoUrl?: string;
  education?: string[];
  certifications?: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  academy?: {
    id: number;
    name: string;
    code: string;
  };
  createdAt: string; // 백엔드에서 제공
  updatedAt: string; // 백엔드에서 제공
}

// Principal의 프로필 정보 수정 요청 타입
export interface UpdatePrincipalProfileRequest {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  certifications?: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

// PrincipalData 전체 초기화용 API Response
export interface PrincipalDataResponse {
  userProfile: PrincipalProfile;
  academy: PrincipalAcademy | null;
  enrollments: PrincipalEnrollment[]; // 백엔드에서 제공
  refundRequests: PrincipalRefundRequest[]; // 백엔드에서 제공
  classes: PrincipalClass[];
  teachers: PrincipalTeacher[];
  students: PrincipalStudent[];
  // sessions는 백엔드에서 제공되지 않음 (classes.classSessions로 대체)
}

// Principal 수강신청 정보
export interface PrincipalEnrollment {
  id: number;
  studentId: number;
  sessionId: number;
  status: string;
  enrolledAt: string;
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      level: string;
      tuitionFee: number;
      teacher: {
        name: string;
      };
    };
  };
}

// Principal 환불 요청 정보
interface PrincipalRefundRequest {
  id: number;
  studentId: number;
  sessionId: number;
  reason: string;
  refundAmount: number;
  status: string;
  requestedAt: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
  sessionEnrollment: {
    session: {
      id: number;
      date: string;
      startTime: string;
      endTime: string;
      class: {
        id: number;
        className: string;
        level: string; // ✅ 백엔드에서 이제 제공함
        teacher: {
          name: string;
        };
      };
    };
    date: string;
    startTime: string;
    endTime: string;
  };
}

export interface CreateSessionContentResponse {
  id: number;
  sessionId: number;
  poseId: number;
  order: number;
  notes?: string;
  createdAt: string;
}

// Re-export from session-content
export type {
  DeleteSessionContentResponse,
  ReorderSessionContentsRequest,
  ReorderSessionContentsResponse,
  SessionContentResponse,
  UpdateSessionContentRequest,
  UpdateSessionContentResponse,
};

// 수강 신청/환불 신청 관련 타입들
export interface SessionWithPendingRequests {
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
  pendingCount: number;
}

export interface EnrollmentRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentPhoneNumber?: string;
  status: string;
  enrolledAt: string;
  reason?: string;
}

export interface RefundRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentPhoneNumber?: string;
  reason: string;
  detailedReason?: string;
  refundAmount: number;
  status: string;
  requestedAt: string;
}

export interface ApproveEnrollmentResponse {
  message: string;
  enrollment: {
    id: number;
    status: string;
    updatedAt: string;
  };
}

export interface RejectEnrollmentRequest {
  reason: string;
  detailedReason?: string;
}

export interface RejectEnrollmentResponse {
  message: string;
  enrollment: {
    id: number;
    status: string;
    rejectedAt: string;
    rejectionReason: string;
    rejectionDetailedReason?: string;
  };
}

export interface ApproveRefundResponse {
  message: string;
  refund: {
    id: number;
    status: string;
    approvedAt: string;
  };
}

export interface RejectRefundRequest {
  reason: string;
  detailedReason?: string;
}

export interface RejectRefundResponse {
  message: string;
  refund: {
    id: number;
    status: string;
    rejectedAt: string;
    rejectionReason: string;
    rejectionDetailedReason?: string;
  };
}

export interface RemoveTeacherResponse {
  message: string;
}

export interface RemoveStudentResponse {
  message: string;
}

export interface StudentSessionHistory {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  class: {
    id: number;
    className: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  enrollmentStatus: string;
  enrolledAt: string;
}

// API 응답 타입들
export type GetPrincipalAcademyResponse = PrincipalAcademy;
export type GetPrincipalAllSessionsResponse = PrincipalClassSession[]; // 백엔드에서 classes.classSessions로 제공
export type GetPrincipalAllClassesResponse = PrincipalClass[];
export type GetPrincipalAllTeachersResponse = PrincipalTeacher[];
export type GetPrincipalAllStudentsResponse = PrincipalStudent[];

// 누락된 타입들 추가
export interface CreatePrincipalClassRequest {
  className: string;
  description?: string;
  level: string;
  maxStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  backgroundColor?: string;
  location?: string;
  teacherId: number;
}

export interface CreateSessionContentRequest {
  poseId: number;
  order?: number;
  notes?: string;
}

// === 선생님 가입 신청 관리 관련 타입들 ===

export interface TeacherJoinRequest {
  id: number;
  teacherId: number;
  teacherName: string;
  teacherPhoneNumber: string;
  teacherIntroduction?: string;
  teacherPhotoUrl?: string;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface TeacherJoinRequestsResponse {
  pendingRequests: TeacherJoinRequest[];
  joinedTeachers: TeacherJoinRequest[];
}

export interface TeacherJoinRequestResponse {
  success: boolean;
  message: string;
  teacher?: {
    id: number;
    name: string;
    phoneNumber: string;
    academyId: number;
  };
}

export interface RejectTeacherJoinRequestRequest {
  reason?: string;
}
