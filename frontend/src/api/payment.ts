import { get, post, put, del } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentResponse,
  GetPaymentBySessionEnrollmentResponse,
  GetStudentPaymentsResponse,
  UpdatePaymentResponse,
  DeletePaymentResponse,
} from "../types/api/payment";

// 결제 생성
export const createPayment = (
  data: CreatePaymentRequest
): Promise<ApiResponse<PaymentResponse>> => {
  return post<ApiResponse<PaymentResponse>>("/payments", data);
};

// 세션 수강 신청별 결제 정보 조회
export const getPaymentBySessionEnrollment = (
  sessionEnrollmentId: number
): Promise<ApiResponse<GetPaymentBySessionEnrollmentResponse>> => {
  return get<ApiResponse<GetPaymentBySessionEnrollmentResponse>>(
    `/payments/session-enrollment/${sessionEnrollmentId}`
  );
};

// 학생별 결제 내역 조회
export const getStudentPayments = (
  studentId: number
): Promise<ApiResponse<GetStudentPaymentsResponse>> => {
  return get<ApiResponse<GetStudentPaymentsResponse>>(
    `/payments/student/${studentId}`
  );
};

// 결제 정보 업데이트
export const updatePayment = (
  sessionEnrollmentId: number,
  data: UpdatePaymentRequest
): Promise<ApiResponse<UpdatePaymentResponse>> => {
  return put<ApiResponse<UpdatePaymentResponse>>(
    `/payments/session-enrollment/${sessionEnrollmentId}`,
    data
  );
};

// 결제 삭제
export const deletePayment = (
  sessionEnrollmentId: number
): Promise<ApiResponse<DeletePaymentResponse>> => {
  return del<ApiResponse<DeletePaymentResponse>>(
    `/payments/session-enrollment/${sessionEnrollmentId}`
  );
};
