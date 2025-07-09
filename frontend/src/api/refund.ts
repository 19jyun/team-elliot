import { apiClient } from "./apiClient";
import {
  CreateRefundRequestDto,
  ProcessRefundRequestDto,
  RefundRequestResponse,
  RefundRequestListResponse,
  GetRefundRequestsParams,
  RefundStatistics,
  CreateRefundRequestResponse,
  CancelRefundRequestResponse,
  ProcessRefundRequestResponse,
} from "@/types/api/refund";

// 환불 API 클라이언트
export const refundApi = {
  // 환불 요청 생성
  createRefundRequest: (
    data: CreateRefundRequestDto
  ): Promise<CreateRefundRequestResponse> => {
    return apiClient.post("/refunds/request", data);
  },

  // 환불 요청 취소
  cancelRefundRequest: (
    refundRequestId: number
  ): Promise<CancelRefundRequestResponse> => {
    return apiClient.delete(`/refunds/request/${refundRequestId}`);
  },

  // 환불 요청 처리 (관리자/강사용)
  processRefundRequest: (
    data: ProcessRefundRequestDto
  ): Promise<ProcessRefundRequestResponse> => {
    return apiClient.put("/refunds/process", data);
  },

  // 학생별 환불 요청 목록 조회
  getStudentRefundRequests: (
    params?: GetRefundRequestsParams
  ): Promise<{ data: RefundRequestListResponse }> => {
    return apiClient.get("/refunds/student", { params });
  },

  // 전체 환불 요청 목록 조회 (관리자/강사용)
  getAllRefundRequests: (
    params?: GetRefundRequestsParams
  ): Promise<{ data: RefundRequestListResponse }> => {
    return apiClient.get("/refunds/all", { params });
  },

  // 환불 요청 상세 조회
  getRefundRequest: (
    refundRequestId: number
  ): Promise<{ data: RefundRequestResponse }> => {
    return apiClient.get(`/refunds/${refundRequestId}`);
  },

  // 환불 통계 조회 (관리자/강사용)
  getRefundStatistics: (
    startDate?: string,
    endDate?: string
  ): Promise<{ data: RefundStatistics }> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get("/refunds/statistics", { params });
  },
};
