import type {
  DayOfWeek,
  EnrollmentStatus,
  RefundStatus,
  ClassSessionBase,
} from "./common";

export interface StudentClass {
  id: number;
  name: string;
  teacherName: string;
  dayOfWeek: DayOfWeek; // string → DayOfWeek로 변경
  startTime: string;
  endTime: string;
  // location 필드는 백엔드에 존재하지 않으므로 제거
}

export interface MyClassesResponse {
  enrollmentClasses: StudentClass[];
  sessionClasses: StudentClass[];
  calendarRange: {
    // 백엔드에서 실제로 제공되는 필드
    startDate: string;
    endDate: string;
  };
}

export type ClassDetailResponse = StudentClass;

export interface EnrollClassResponse {
  success: boolean;
  message: string;
}

export interface UnenrollClassResponse {
  success: boolean;
  message: string;
}

// 학생 개인 정보 타입
export interface StudentProfile {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string | null;
  emergencyContact: string | null;
  birthDate: string | null;
  notes: string | null;
  level: string | null;
  createdAt: string;
  updatedAt: string;
}

// 개인 정보 수정 요청 타입
export interface UpdateStudentProfileRequest {
  name?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  birthDate?: string;
  notes?: string;
  level?: string;
}

// 수강 내역 타입
export interface EnrollmentHistory {
  id: number;
  sessionId: number;
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      teacherName: string;
    };
  };
  enrolledAt: string;
  status: EnrollmentStatus; // 공통 타입 사용
  description?: string;
  // 거절 사유 정보
  enrollmentRejection?: RejectionDetail;
  refundRejection?: RejectionDetail;
  // 낙관적 업데이트용 플래그
  isOptimistic?: boolean;
}

// 거절 사유 타입
export interface RejectionDetail {
  id: number;
  reason: string;
  detailedReason?: string;
  rejectedAt: string;
  rejector: {
    id: number;
    name: string;
  };
}

// 환불/취소 내역 타입
export interface CancellationHistory {
  id: number;
  sessionId: number;
  className: string;
  teacherName: string;
  sessionDate: string;
  sessionTime: string;
  refundAmount: number;
  status: RefundStatus; // 공통 타입 사용
  reason: string;
  detailedReason?: string;
  requestedAt: string;
  processedAt?: string;
  cancelledAt?: string;
  // 거절 사유 정보
  rejectionDetail?: RejectionDetail;
  // 낙관적 업데이트용 플래그
  isOptimistic?: boolean;
}

// 수강 내역 응답 타입 (백엔드에서 배열을 직접 반환)
export type EnrollmentHistoryResponse = EnrollmentHistory[];

// 환불/취소 내역 응답 타입 (백엔드에서 배열을 직접 반환)
export type CancellationHistoryResponse = CancellationHistory[];

// === 새로 추가된 타입들 ===

// 세션별 입금 정보 조회 응답 타입 (백엔드 응답 구조에 맞춰 수정)
export interface SessionPaymentInfo {
  sessionId: number;
  className: string;
  sessionDate: string;
  sessionTime: string;
  tuitionFee: number;
  principal: {
    id: number;
    name: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export type GetSessionPaymentInfoResponse = SessionPaymentInfo;

// 학원 가입 요청 타입
export interface StudentJoinAcademyRequest {
  code: string;
}

export interface StudentJoinAcademyResponse {
  success: boolean;
  message: string;
  academyId?: number;
}

// 학원 탈퇴 요청 타입
export interface StudentLeaveAcademyRequest {
  academyId: number;
}

export interface StudentLeaveAcademyResponse {
  success: boolean;
  message: string;
}

// 학원 목록 조회 응답 타입
export interface GetAcademiesResponse {
  academies: Array<{
    id: number;
    name: string;
    description?: string;
    address?: string;
    phoneNumber?: string;
  }>;
}

// 내 학원 목록 조회 응답 타입
export type GetMyAcademiesResponse = Array<{
  id: number;
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  joinedAt: string;
}>;

// 수강 가능한 세션 조회 응답 타입
export interface AvailableSessionForEnrollment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  teacherName: string;
  maxStudents: number;
  currentEnrollments: number;
  tuitionFee: number;
  isEnrolled: boolean;
}

export type GetStudentAvailableSessionsForEnrollmentResponse =
  AvailableSessionForEnrollment[];

// 수강신청/변경 관련 타입들
export interface StudentBatchEnrollSessionsRequest {
  sessionIds: number[];
}

export interface StudentBatchEnrollSessionsResponse {
  success: boolean;
  message: string;
  enrolledSessions: number[];
  failedSessions: Array<{
    sessionId: number;
    reason: string;
  }>;
}

export interface ClassSessionForModification {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  teacherName: string;
  isEnrolled: boolean;
  enrollmentId?: number;
  enrollmentStatus?: EnrollmentStatus; // 공통 타입 사용
  // 백엔드에서 추가하는 속성들
  class: {
    id: number;
    className: string;
    tuitionFee: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  isSelectable: boolean;
  canBeCancelled: boolean;
  isModifiable: boolean;
  isPastStartTime: boolean;
  isFull: boolean;
  isAlreadyEnrolled: boolean;
  isEnrollable: boolean;
}

export interface GetClassSessionsForModificationResponse {
  sessions: ClassSessionForModification[];
  calendarRange: {
    startDate: string;
    endDate: string;
  } | null;
}

export interface StudentBatchModifyEnrollmentsRequest {
  cancellations: number[];
  newEnrollments: number[];
  reason?: string;
}

export interface StudentBatchModifyEnrollmentsResponse {
  success: boolean;
  message: string;
  cancelledSessions: number[];
  newlyEnrolledSessions: number[];
  failedOperations: Array<{
    sessionId: number;
    operation: "CANCEL" | "ENROLL";
    reason: string;
  }>;
}

export interface ClassSessionForEnrollment extends ClassSessionBase {
  className: string;
  teacherName: string;
  maxStudents: number;
  currentEnrollments: number;
  tuitionFee: number;
  isEnrolled: boolean;
  enrollmentId?: number;
  enrollmentStatus?: EnrollmentStatus; // 공통 타입 사용
}

export type GetClassSessionsForEnrollmentResponse = ClassSessionForEnrollment[];

// 선생님용: 수강생을 학원에서 제거
export interface RemoveStudentFromAcademyResponse {
  success: boolean;
  message: string;
}
