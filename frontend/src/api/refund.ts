import { apiClient } from "./apiClient";
import type {
  CreateRefundRequestDto,
  CancelRefundRequestResponse,
  CreateRefundRequestResponse,
  RefundRequestListResponse,
  RefundRequestResponse,
  RefundStatistics,
  ProcessRefundRequestDto,
  ProcessRefundRequestResponse,
  GetRefundRequestsParams,
} from "@/types/api/refund";

// 학생/원장 호환용 Refund API (기존 컴포넌트 유지 목적)
export const refundApi = {
  createRefundRequest: (
    data: CreateRefundRequestDto
  ): Promise<CreateRefundRequestResponse> => {
    return apiClient.post("/refunds/request", data);
  },

  cancelRefundRequest: (
    refundRequestId: number
  ): Promise<CancelRefundRequestResponse> => {
    return apiClient.delete(`/refunds/request/${refundRequestId}`);
  },

  // 학생 전용 목록
  getStudentRefundRequests: (
    params?: GetRefundRequestsParams
  ): Promise<{ data: RefundRequestListResponse }> => {
    return apiClient.get("/refunds/student", { params });
  },

  // 원장 전용 목록
  getAllRefundRequests: (
    params?: GetRefundRequestsParams
  ): Promise<{ data: RefundRequestListResponse }> => {
    return apiClient.get("/refunds/all", { params });
  },

  getRefundRequest: (
    refundRequestId: number
  ): Promise<{ data: RefundRequestResponse }> => {
    return apiClient.get(`/refunds/${refundRequestId}`);
  },

  // 통계(선택적): 백엔드에 없으면 사용 안 함
  getRefundStatistics: (
    startDate?: string,
    endDate?: string
  ): Promise<{ data: RefundStatistics }> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get("/refunds/statistics", { params });
  },

  // 처리 로직(선택적): 백엔드에 process 엔드포인트가 없으면 미사용
  processRefundRequest: (
    data: ProcessRefundRequestDto
  ): Promise<ProcessRefundRequestResponse> => {
    return apiClient.put("/refunds/process", data);
  },
};
