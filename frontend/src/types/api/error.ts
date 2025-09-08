// 공통 API 에러 타입 정의

// 백엔드에서 전송하는 에러 응답 구조
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// HTTP 에러 응답 구조 (axios 등에서 사용)
export interface HttpErrorResponse {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
}

// 일반적인 에러 객체
export interface GeneralError {
  message?: string;
  code?: string;
  name?: string;
}

// 모든 가능한 에러 타입의 유니온
export type UnknownError = HttpErrorResponse | GeneralError | Error | unknown;

// 에러 메시지 추출 유틸리티 함수
export function extractErrorMessage(
  error: UnknownError,
  fallbackMessage: string = "알 수 없는 오류가 발생했습니다."
): string {
  // HttpErrorResponse 타입 체크
  if (error && typeof error === "object" && "response" in error) {
    const httpError = error as HttpErrorResponse;
    if (httpError.response?.data?.message) {
      return httpError.response.data.message;
    }
  }

  // GeneralError 타입 체크
  if (error && typeof error === "object" && "message" in error) {
    const generalError = error as GeneralError;
    if (typeof generalError.message === "string") {
      return generalError.message;
    }
  }

  // Error 객체 타입 체크
  if (error instanceof Error) {
    return error.message;
  }

  // 문자열인 경우
  if (typeof error === "string") {
    return error;
  }

  return fallbackMessage;
}

// 에러 코드 추출 유틸리티 함수
export function extractErrorCode(error: UnknownError): string | undefined {
  // HttpErrorResponse 타입 체크
  if (error && typeof error === "object" && "response" in error) {
    const httpError = error as HttpErrorResponse;
    if (httpError.response?.data?.code) {
      return httpError.response.data.code;
    }
  }

  // GeneralError 타입 체크
  if (error && typeof error === "object" && "code" in error) {
    const generalError = error as GeneralError;
    if (typeof generalError.code === "string") {
      return generalError.code;
    }
  }

  return undefined;
}

// HTTP 상태 코드 추출 유틸리티 함수
export function extractHttpStatus(error: UnknownError): number | undefined {
  if (error && typeof error === "object" && "response" in error) {
    const httpError = error as HttpErrorResponse;
    return httpError.response?.status;
  }
  return undefined;
}
