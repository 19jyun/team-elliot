/**
 * 회원 탈퇴 관련 타입 정의
 */

import { AxiosError } from "axios";

/**
 * 회원 탈퇴 에러 코드
 */
export enum WithdrawalErrorCode {
  /** 진행 중인 수업이 있음 (Teacher/Principal) */
  HAS_ONGOING_CLASSES = "HAS_ONGOING_CLASSES",
  /** 처리되지 않은 환불 요청이 있음 (Principal만) */
  HAS_PENDING_REFUNDS = "HAS_PENDING_REFUNDS",
  /** 처리되지 않은 수강 신청이 있음 (Teacher/Principal) */
  HAS_PENDING_ENROLLMENTS = "HAS_PENDING_ENROLLMENTS",
}

/**
 * 진행 중인 수업 정보
 */
export interface OngoingClass {
  id: number;
  name: string;
  endDate: string;
}

/**
 * 회원 탈퇴 에러 상세 정보
 */
export interface WithdrawalErrorDetails {
  /** 진행 중인 수업 개수 */
  ongoingClassCount?: number;
  /** 진행 중인 수업 목록 */
  classes?: OngoingClass[];
  /** 처리 대기 중인 환불 요청 개수 */
  pendingRefundCount?: number;
  /** 처리 대기 중인 수강 신청 개수 */
  pendingEnrollmentCount?: number;
}

/**
 * 회원 탈퇴 에러 응답
 */
export interface WithdrawalErrorResponse {
  success: false;
  statusCode: number;
  error: {
    code: WithdrawalErrorCode | string;
    message: string;
    details?: WithdrawalErrorDetails;
  };
  timestamp: string;
  path: string;
}

/**
 * 회원 탈퇴 성공 응답
 */
export interface WithdrawalSuccessResponse {
  success: true;
  data: {
    message: string;
  };
  timestamp: string;
  path: string;
}

/**
 * Axios 에러 타입 가드
 */
export function isAxiosError(
  error: unknown
): error is AxiosError<WithdrawalErrorResponse> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    error.isAxiosError === true
  );
}

/**
 * 회원 탈퇴 에러 응답 타입 가드
 */
export function isWithdrawalError(
  error: unknown
): error is AxiosError<WithdrawalErrorResponse> {
  if (!isAxiosError(error)) {
    return false;
  }

  const data = error.response?.data;
  return (
    data !== undefined &&
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "code" in data.error
  );
}
