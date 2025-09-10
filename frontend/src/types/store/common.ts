// 공통으로 사용되는 Redux 타입들

// 사용자 관련 타입
interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "PRINCIPAL";
  phoneNumber?: string;
}

// 수강신청 관련 타입
export interface SessionEnrollment {
  id: number;
  studentId: number;
  sessionId: number;
  status: string;
  enrolledAt: string;
  cancelledAt?: string;
  rejectedAt?: string;
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      teacher: {
        name: string;
      };
    };
  };
  student: {
    id: number;
    name: string;
  };
  refundRequests?: RefundRequest[];
}

// 환불 요청 관련 타입
interface RefundRequest {
  id: number;
  sessionEnrollmentId: number;
  studentId: number;
  reason: string;
  detailedReason?: string;
  refundAmount: number;
  status: string;
  processReason?: string;
  actualRefundAmount?: number;
  processedBy?: number;
  processedAt?: string;
  requestedAt: string;
  cancelledAt?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  sessionEnrollment: {
    session: {
      id: number;
      date: string;
      startTime: string;
      endTime: string;
      class: {
        id: number;
        className: string;
        level: string;
        teacher: {
          name: string;
        };
      };
    };
    date: string;
    startTime: string;
    endTime: string;
  };
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
  processor?: {
    name: string;
  };
}

// 공통 상태 타입
export interface CommonState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}
