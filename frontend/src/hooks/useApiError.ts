import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AppError, ErrorType } from "@/types/api";
import { ErrorHandler } from "@/lib/errorHandler";

interface UseApiErrorReturn {
  fieldErrors: Record<string, string>;
  setFieldErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  handleError: (error: AppError) => void;
  handleApiError: (error: any) => void;
}

export function useApiError(): UseApiErrorReturn {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const handleError = useCallback((error: AppError) => {
    const userMessage = ErrorHandler.getUserFriendlyMessage(error);

    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        if (error.field === "credentials") {
          // 로그인 시 아이디/비밀번호 필드에 에러 표시
          setFieldErrors({
            userId: userMessage,
            password: " ",
          });
        } else if (error.field) {
          // 특정 필드에 에러 표시
          setFieldErrors({
            [error.field]: userMessage,
          });
        } else {
          // 일반적인 인증 에러
          toast.error(userMessage);
        }
        break;

      case ErrorType.VALIDATION:
        if (error.fieldErrors) {
          // 필드별 에러 처리
          const fieldErrorMap: Record<string, string> = {};
          error.fieldErrors.forEach((fieldError) => {
            fieldErrorMap[fieldError.field] = fieldError.message;
          });
          setFieldErrors(fieldErrorMap);
        } else if (error.field) {
          // 단일 필드 에러
          setFieldErrors({
            [error.field]: userMessage,
          });
        } else {
          toast.error(userMessage);
        }
        break;

      case ErrorType.BUSINESS:
        toast.error(userMessage);
        break;

      case ErrorType.NETWORK:
        toast.error(userMessage);
        break;

      case ErrorType.SYSTEM:
        toast.error(userMessage);
        break;

      default:
        toast.error(userMessage);
        break;
    }
  }, []);

  const handleApiError = useCallback(
    (error: any) => {
      if (error && typeof error === "object" && "type" in error) {
        // 이미 AppError 형태인 경우
        handleError(error as AppError);
      } else {
        // 일반적인 에러인 경우
        const appError: AppError = {
          type: ErrorType.SYSTEM,
          code: "UNKNOWN_ERROR",
          message: error?.message || "알 수 없는 오류가 발생했습니다.",
          recoverable: true,
        };
        handleError(appError);
      }
    },
    [handleError]
  );

  return {
    fieldErrors,
    setFieldErrors,
    clearErrors,
    handleError,
    handleApiError,
  };
}
