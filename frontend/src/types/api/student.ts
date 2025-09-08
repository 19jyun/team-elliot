import type {
  DayOfWeek,
  EnrollmentStatus,
  RefundStatusType,
  ClassSessionBase,
} from "./common";
import type { Class } from "./class";
import type { ClassSession as Session } from "./class";
import type { GetAcademiesResponse, GetMyAcademiesResponse } from "./academy";

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
  enrollmentClasses: Class[]; // 백엔드에서 Class[] 반환
  sessionClasses: Session[]; // 백엔드에서 Session[] 반환 (session_id, enrollment_status, enrollment_id 포함)
  calendarRange: {
    // 백엔드에서 실제로 제공되는 필드
    startDate: string; // API 응답에서는 Date가 string으로 직렬화됨
    endDate: string; // API 응답에서는 Date가 string으로 직렬화됨
  };
}

export type ClassDetailResponse = StudentClass;

// EnrollClassResponse는 class.ts에서 정의됨

// UnenrollClassResponse는 class.ts에서 정의됨

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
  status: RefundStatusType; // 공통 타입 사용
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

// 수강 가능한 세션 조회 응답 타입
export interface AvailableSessionForEnrollment {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  currentStudents: number;
  isEnrollable: boolean;
  isFull: boolean;
  isPastStartTime: boolean;
  isAlreadyEnrolled: boolean;
  studentEnrollmentStatus?: string;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    className: string;
    level: string;
    tuitionFee: string;
    teacher: {
      id: number;
      name: string;
    };
    academy: {
      id: number;
      name: string;
    };
  };
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

// ClassSessionForModification과 GetClassSessionsForModificationResponse는 class.ts에서 정의됨

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

// GetClassSessionsForEnrollmentResponse는 class.ts에서 정의됨

// 선생님용: 수강생을 학원에서 제거
export interface RemoveStudentFromAcademyResponse {
  success: boolean;
  message: string;
}

// Re-export from academy
export type { GetAcademiesResponse, GetMyAcademiesResponse };
