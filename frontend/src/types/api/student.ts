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
  status: "ENROLLED" | "CANCELLED" | "TEACHER_CANCELLED";
  description?: string;
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
  status:
    | "REFUND_REQUESTED"
    | "REFUND_CANCELLED"
    | "REFUND_REJECTED_CONFIRMED"
    | "REJECTED"
    | "CANCELLED"
    | "TEACHER_CANCELLED";
  description?: string;
  payment?: {
    id: number;
    amount: number;
    status: string;
  };
  refundRequests?: Array<{
    id: number;
    refundAmount: number;
    status: string;
    requestedAt: string;
  }>;
  // 거절 사유 정보
  enrollmentRejection?: RejectionDetail;
  refundRejection?: RejectionDetail;
}

// 수강 내역 응답 타입 (백엔드에서 배열을 직접 반환)
export type EnrollmentHistoryResponse = EnrollmentHistory[];

// 환불/취소 내역 응답 타입 (백엔드에서 배열을 직접 반환)
export type CancellationHistoryResponse = CancellationHistory[];
