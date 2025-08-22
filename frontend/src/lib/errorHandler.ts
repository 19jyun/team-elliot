import { ApiResponse, AppError, ErrorType, FieldError } from "@/types/api";

export class ErrorHandler {
  /**
   * 백엔드 API 응답을 프론트엔드 에러 객체로 변환
   */
  static handle(response: ApiResponse): AppError | null {
    if (response.success) {
      return null; // 성공
    }

    const { error } = response;

    if (!error) {
      return {
        type: ErrorType.SYSTEM,
        code: "UNKNOWN_ERROR",
        message: "알 수 없는 오류가 발생했습니다.",
        recoverable: false,
      };
    }

    return this.mapErrorCodeToAppError(
      error.code,
      error.message,
      error.details
    );
  }

  /**
   * 네트워크 에러 처리
   */
  static handleNetworkError(error: any): AppError {
    if (!navigator.onLine) {
      return {
        type: ErrorType.NETWORK,
        code: "NETWORK_OFFLINE",
        message: "인터넷 연결을 확인해주세요.",
        recoverable: true,
      };
    }

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return {
        type: ErrorType.NETWORK,
        code: "REQUEST_TIMEOUT",
        message: "요청 시간이 초과되었습니다. 다시 시도해주세요.",
        recoverable: true,
      };
    }

    return {
      type: ErrorType.NETWORK,
      code: "NETWORK_ERROR",
      message: "네트워크 연결을 확인해주세요.",
      recoverable: true,
    };
  }

  /**
   * 에러 코드를 AppError로 매핑
   */
  private static mapErrorCodeToAppError(
    code: string,
    message: string,
    details?: any
  ): AppError {
    switch (code) {
      // 인증 관련 에러
      case "USER_NOT_FOUND":
      case "INVALID_PASSWORD":
        return {
          type: ErrorType.AUTHENTICATION,
          code,
          message,
          field: "credentials", // 아이디/비밀번호 필드에 표시
          recoverable: true,
        };

      case "PRINCIPAL_NOT_FOUND":
      case "TEACHER_NOT_FOUND":
      case "STUDENT_NOT_FOUND":
        return {
          type: ErrorType.AUTHENTICATION,
          code,
          message,
          recoverable: false,
        };

      case "TOKEN_EXPIRED":
      case "INVALID_TOKEN":
        return {
          type: ErrorType.AUTHENTICATION,
          code,
          message,
          recoverable: false,
          action: () => {
            // 로그아웃 처리
            if (typeof window !== "undefined") {
              localStorage.removeItem("session");
              window.location.href = "/auth";
            }
          },
        };

      // 권한 관련 에러
      case "INSUFFICIENT_PERMISSIONS":
      case "FORBIDDEN":
        return {
          type: ErrorType.AUTHORIZATION,
          code,
          message,
          recoverable: false,
        };

      // 검증 관련 에러
      case "VALIDATION_ERROR":
        return {
          type: ErrorType.VALIDATION,
          code,
          message,
          fieldErrors: this.extractFieldErrors(details),
          recoverable: true,
        };

      case "USER_ID_ALREADY_EXISTS":
        return {
          type: ErrorType.VALIDATION,
          code,
          message,
          field: "userId",
          recoverable: true,
        };

      // 비즈니스 로직 에러
      case "CLASS_FULL":
      case "ENROLLMENT_EXISTS":
      case "REFUND_REQUEST_EXISTS":
        return {
          type: ErrorType.BUSINESS,
          code,
          message,
          recoverable: true,
        };

      // 리소스 관련 에러
      case "NOT_FOUND":
        return {
          type: ErrorType.BUSINESS,
          code,
          message,
          recoverable: false,
        };

      case "CONFLICT":
        return {
          type: ErrorType.BUSINESS,
          code,
          message,
          recoverable: true,
        };

      // 시스템 에러
      case "INTERNAL_SERVER_ERROR":
      case "DATABASE_ERROR":
        return {
          type: ErrorType.SYSTEM,
          code,
          message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          recoverable: true,
        };

      // 기본 에러
      default:
        return {
          type: ErrorType.SYSTEM,
          code,
          message,
          recoverable: true,
        };
    }
  }

  /**
   * 필드 에러 추출
   */
  private static extractFieldErrors(details: any): FieldError[] {
    if (!details || !Array.isArray(details.fieldErrors)) {
      return [];
    }

    return details.fieldErrors.map((fieldError: any) => ({
      field: fieldError.field,
      message: fieldError.message,
      value: fieldError.value,
    }));
  }

  /**
   * 사용자 친화적인 에러 메시지 생성
   */
  static getUserFriendlyMessage(error: AppError): string {
    const messageMap: Record<string, string> = {
      USER_NOT_FOUND: "아이디 또는 비밀번호가 올바르지 않습니다.",
      INVALID_PASSWORD: "아이디 또는 비밀번호가 올바르지 않습니다.",
      USER_ID_ALREADY_EXISTS: "이미 사용 중인 아이디입니다.",
      TOKEN_EXPIRED: "로그인이 만료되었습니다. 다시 로그인해주세요.",
      INSUFFICIENT_PERMISSIONS: "이 작업을 수행할 권한이 없습니다.",
      CLASS_FULL: "수강 인원이 초과되었습니다.",
      ENROLLMENT_EXISTS: "이미 수강 신청한 클래스입니다.",
      NETWORK_OFFLINE: "인터넷 연결을 확인해주세요.",
      REQUEST_TIMEOUT: "요청 시간이 초과되었습니다. 다시 시도해주세요.",
    };

    return messageMap[error.code] || error.message;
  }
}

