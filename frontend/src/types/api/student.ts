export interface StudentClass {
  id: number;
  name: string;
  teacherName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  [key: string]: any;
}

export interface MyClassesResponse {
  enrollmentClasses: StudentClass[];
  sessionClasses: StudentClass[];
  calendarRange?: {
    startDate: string;
    endDate: string;
  };
}
export interface ClassDetailResponse extends StudentClass {}
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
export interface UpdateProfileRequest {
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
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "REFUND_REQUESTED";
  description?: string;
  // 거절 사유 정보
  enrollmentRejection?: RejectionDetail;
  refundRejection?: RejectionDetail;
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
  status: "REFUND_REQUESTED" | "APPROVED" | "REJECTED";
  reason: string;
  detailedReason?: string;
  requestedAt: string;
  processedAt?: string;
  cancelledAt?: string;
  // 거절 사유 정보
  rejectionDetail?: RejectionDetail;
}

// 수강 내역 응답 타입 (백엔드에서 배열을 직접 반환)
export type EnrollmentHistoryResponse = EnrollmentHistory[];

// 환불/취소 내역 응답 타입 (백엔드에서 배열을 직접 반환)
export type CancellationHistoryResponse = CancellationHistory[];
