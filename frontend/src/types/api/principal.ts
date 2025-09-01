// Principal 전용 API 타입들

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

// Principal의 학원 세션 정보 (캘린더용)
export interface PrincipalSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  classId: number;
  class: {
    id: number;
    className: string;
    level: string;
    maxStudents: number;
    currentStudents: number;
    teacher: {
      id: number;
      name: string;
    };
  };
  enrollmentCount: number;
  confirmedCount: number;
}

// Principal의 학원 클래스 정보
export interface PrincipalClass {
  id: number;
  className: string;
  description?: string;
  level: string;
  maxStudents: number;
  currentStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  backgroundColor?: string;
  location?: string;
  teacher: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
  isRegistrationOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

// Principal의 학원 선생님 정보
export interface PrincipalTeacher {
  id: number;
  name: string;
  phoneNumber?: string;
  introduction?: string;
  photoUrl?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  joinedAt: string;
  totalClasses: number;
  activeClasses: number;
}

// Principal의 학원 수강생 정보
export interface PrincipalStudent {
  id: number;
  name: string;
  phoneNumber?: string;
  emergencyContact?: string;
  birthDate?: string;
  notes?: string;
  level?: string;
  joinedAt?: string;
  totalSessions: number;
  confirmedSessions: number;
  pendingSessions: number;
  totalClasses: number;
  activeClasses: number;
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
  name: string;
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
  classes: PrincipalClass[];
  sessions: PrincipalSession[];
  teachers: PrincipalTeacher[];
  students: PrincipalStudent[];
}

// 세션 컨텐츠 관련 응답 타입들
export interface SessionContentResponse {
  id: number;
  sessionId: number;
  poseId: number;
  order: number;
  notes?: string;
  createdAt: string;
  pose: {
    id: number;
    name: string;
    imageUrl?: string;
    description: string;
    difficulty: string;
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

export interface UpdateSessionContentResponse {
  id: number;
  sessionId: number;
  poseId: number;
  order: number;
  notes?: string;
  updatedAt: string;
}

export interface DeleteSessionContentResponse {
  message: string;
}

export interface ReorderSessionContentsRequest {
  orderedContentIds: number[];
}

export interface ReorderSessionContentsResponse {
  message: string;
  contents: SessionContentResponse[];
}

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
export type GetPrincipalAllSessionsResponse = PrincipalSession[];
export type GetPrincipalAllClassesResponse = PrincipalClass[];
export type GetPrincipalAllTeachersResponse = PrincipalTeacher[];
export type GetPrincipalAllStudentsResponse = PrincipalStudent[];
