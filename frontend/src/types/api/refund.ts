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
enum RefundReason {
  PERSONAL_SCHEDULE = "PERSONAL_SCHEDULE",
  HEALTH_ISSUE = "HEALTH_ISSUE",
  DISSATISFACTION = "DISSATISFACTION",
  FINANCIAL_ISSUE = "FINANCIAL_ISSUE",
  OTHER = "OTHER",
}

// 환불 처리 요청 타입
export interface ProcessRefundRequestDto {
  refundRequestId: number;
  status: RefundStatus;
  processReason: string;
  actualRefundAmount?: number;
}

// 환불 상태 enum (Refund API 전용 - 더 상세한 상태 포함)
export enum RefundStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PARTIAL_APPROVED = "PARTIAL_APPROVED",
  CANCELLED = "CANCELLED",
}

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
      id: number;
      class: {
        id: number;
        className: string;
        level: string;
        teacher: {
          name: string;
        };
      };
      date: string;
      startTime: string;
      endTime: string;
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

// 전체 환불 요청 목록 조회 응답 타입
export type GetRefundRequestsResponse = RefundRequestResponse[];
