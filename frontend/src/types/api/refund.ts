// 환불 요청 생성 요청 타입
export interface CreateRefundRequestDto {
  sessionEnrollmentId: number;
  reason: RefundReason;
  detailedReason?: string;
  refundAmount: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

// 환불 사유 enum
export enum RefundReason {
  PERSONAL_SCHEDULE = "PERSONAL_SCHEDULE",
  HEALTH_ISSUE = "HEALTH_ISSUE",
  DISSATISFACTION = "DISSATISFACTION",
  FINANCIAL_ISSUE = "FINANCIAL_ISSUE",
  OTHER = "OTHER",
}

// 환불 사유 한국어 라벨
export const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  [RefundReason.PERSONAL_SCHEDULE]: "개인 일정",
  [RefundReason.HEALTH_ISSUE]: "건강상 문제",
  [RefundReason.DISSATISFACTION]: "서비스 불만족",
  [RefundReason.FINANCIAL_ISSUE]: "경제적 사유",
  [RefundReason.OTHER]: "기타",
};

// 환불 처리 요청 타입
export interface ProcessRefundRequestDto {
  refundRequestId: number;
  status: RefundStatus;
  processReason: string;
  actualRefundAmount?: number;
}

// 환불 상태 enum
export enum RefundStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PARTIAL_APPROVED = "PARTIAL_APPROVED",
  CANCELLED = "CANCELLED",
}

// 환불 상태 한국어 라벨
export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  [RefundStatus.PENDING]: "대기중",
  [RefundStatus.APPROVED]: "승인됨",
  [RefundStatus.REJECTED]: "거부됨",
  [RefundStatus.PARTIAL_APPROVED]: "부분 승인",
  [RefundStatus.CANCELLED]: "취소됨",
};

// 환불 상태 색상
export const REFUND_STATUS_COLORS: Record<RefundStatus, string> = {
  [RefundStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [RefundStatus.APPROVED]: "bg-green-100 text-green-800",
  [RefundStatus.REJECTED]: "bg-red-100 text-red-800",
  [RefundStatus.PARTIAL_APPROVED]: "bg-blue-100 text-blue-800",
  [RefundStatus.CANCELLED]: "bg-gray-100 text-gray-800",
};

// 환불 요청 응답 타입
export interface RefundRequestResponse {
  id: number;
  sessionEnrollmentId: number;
  studentId: number;
  reason: string;
  detailedReason?: string;
  refundAmount: number;
  status: RefundStatus;
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
      class: {
        className: string;
        teacher: {
          name: string;
        };
      };
      date: string;
      startTime: string;
      endTime: string;
    };
  };
  student: {
    name: string;
  };
  processor?: {
    name: string;
  };
}

// 환불 요청 목록 조회 응답 타입
export interface RefundRequestListResponse {
  refundRequests: RefundRequestResponse[];
  total: number;
  page: number;
  limit: number;
}

// 환불 요청 조회 파라미터 타입
export interface GetRefundRequestsParams {
  page?: number;
  limit?: number;
  status?: RefundStatus;
  startDate?: string;
  endDate?: string;
}

// 환불 통계 타입
export interface RefundStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  partialApproved: number;
  cancelled: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
}

// 환불 요청 생성 응답 타입
export interface CreateRefundRequestResponse {
  data: RefundRequestResponse;
  message: string;
}

// 환불 요청 취소 응답 타입
export interface CancelRefundRequestResponse {
  data: RefundRequestResponse;
  message: string;
}

// 환불 요청 처리 응답 타입
export interface ProcessRefundRequestResponse {
  data: RefundRequestResponse;
  message: string;
}
