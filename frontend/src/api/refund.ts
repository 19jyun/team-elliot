import { get, post, put, del } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  CreateRefundRequestDto,
  CancelRefundRequestResponse,
  RefundRequestListResponse,
  RefundRequestResponse,
  RefundStatistics,
  ProcessRefundRequestDto,
  ProcessRefundRequestResponse,
  GetRefundRequestsParams,
} from "@/types/api/refund";

// === 환불 요청 생성 ===
const createRefundRequest = (
  data: CreateRefundRequestDto
): Promise<ApiResponse<RefundRequestResponse>> => {
  return post<ApiResponse<RefundRequestResponse>>("/refunds/request", data);
};

// === 환불 요청 취소 ===
const cancelRefundRequest = (
  refundRequestId: number
): Promise<ApiResponse<CancelRefundRequestResponse>> => {
  return del<ApiResponse<CancelRefundRequestResponse>>(
    `/refunds/request/${refundRequestId}`
  );
};

// === 학생 전용 환불 요청 목록 ===
const getStudentRefundRequests = (
  params?: GetRefundRequestsParams
): Promise<ApiResponse<RefundRequestListResponse>> => {
  return get<ApiResponse<RefundRequestListResponse>>("/refunds/student", {
    params,
  });
};

// === 원장 전용 전체 환불 요청 목록 ===
const getAllRefundRequests = (
  params?: GetRefundRequestsParams
): Promise<ApiResponse<RefundRequestListResponse>> => {
  return get<ApiResponse<RefundRequestListResponse>>("/refunds/all", {
    params,
  });
};

// === 환불 요청 상세 조회 ===
const getRefundRequest = (
  refundRequestId: number
): Promise<ApiResponse<RefundRequestResponse>> => {
  return get<ApiResponse<RefundRequestResponse>>(`/refunds/${refundRequestId}`);
};

// === 환불 통계 조회 ===
const getRefundStatistics = (
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<RefundStatistics>> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return get<ApiResponse<RefundStatistics>>("/refunds/statistics", { params });
};

// === 환불 요청 처리 ===
const processRefundRequest = (
  data: ProcessRefundRequestDto
): Promise<ApiResponse<ProcessRefundRequestResponse>> => {
  return put<ApiResponse<ProcessRefundRequestResponse>>(
    "/refunds/process",
    data
  );
};

// === 기존 컴포넌트 호환성을 위한 레거시 API 객체 ===
// TODO: 기존 컴포넌트들을 새로운 함수들로 마이그레이션 후 제거
export const refundApi = {
  createRefundRequest,
  cancelRefundRequest,
  getStudentRefundRequests,
  getAllRefundRequests,
  getRefundRequest,
  getRefundStatistics,
  processRefundRequest,
};
