import type { PaymentStatus } from "./common";

// Payment 관련 API 타입들

// 결제 방법 enum
export enum PaymentMethod {
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
}

// 결제 생성 요청 타입
export interface CreatePaymentRequest {
  sessionEnrollmentId: number;
  studentId: number;
  amount: number;
  status?: PaymentStatus;
  method: PaymentMethod;
  paidAt?: string;
}

// 결제 수정 요청 타입
export interface UpdatePaymentRequest {
  status?: PaymentStatus;
  method?: PaymentMethod;
  paidAt?: string;
  amount?: number;
}

// 결제 정보 응답 타입
export interface PaymentResponse {
  id: number;
  sessionEnrollmentId: number;
  studentId: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  sessionEnrollment?: {
    id: number;
    session: {
      id: number;
      date: string;
      startTime: string;
      endTime: string;
      class: {
        id: number;
        className: string;
        teacher: {
          id: number;
          name: string;
        };
      };
    };
    student: {
      id: number;
      name: string;
    };
  };
}

// 세션 수강 신청별 결제 정보 조회 응답 타입
export type GetPaymentBySessionEnrollmentResponse = PaymentResponse;

// 학생별 결제 내역 조회 응답 타입
export type GetStudentPaymentsResponse = PaymentResponse[];

// 결제 정보 업데이트 응답 타입
export type UpdatePaymentResponse = PaymentResponse;

// 결제 삭제 응답 타입
export interface DeletePaymentResponse {
  message: string;
}

// Re-export from common
export type { PaymentStatus };
