import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/errorHandler";
import { AppError, ErrorType } from "@/types/api";

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
        // Academy 관련 에러 코드별 세분화된 처리
        if (error.code) {
          switch (error.code) {
            // Academy 관련 에러들
            case "ACADEMY_NOT_FOUND":
              toast.error("존재하지 않는 학원입니다.");
              break;
            case "ACADEMY_CODE_ALREADY_EXISTS":
              setFieldErrors({ code: "이미 사용중인 학원 코드입니다." });
              break;
            case "ACADEMY_HAS_TEACHERS":
              toast.error("소속된 선생님이 있어 삭제할 수 없습니다.");
              break;
            case "ACADEMY_HAS_STUDENTS":
              toast.error("가입된 학생이 있어 삭제할 수 없습니다.");
              break;
            case "ACADEMY_CODE_NOT_FOUND":
              setFieldErrors({ code: "존재하지 않는 학원 코드입니다." });
              break;

            // Student 관련 에러들
            case "STUDENT_NOT_FOUND":
              toast.error("학생 정보를 찾을 수 없습니다.");
              break;
            case "STUDENT_ALREADY_JOINED":
              toast.error("이미 가입된 학원입니다.");
              break;
            case "STUDENT_NOT_JOINED":
              toast.error("가입되지 않은 학원입니다.");
              break;
            case "STUDENT_NOT_IN_ACADEMY":
              toast.error("해당 학원에 속하지 않은 학생입니다.");
              break;

            // Teacher 관련 에러들
            case "TEACHER_NOT_FOUND":
              toast.error("선생님 정보를 찾을 수 없습니다.");
              break;
            case "TEACHER_NOT_IN_ACADEMY":
              toast.error("소속된 학원이 없습니다.");
              break;
            case "TEACHER_ALREADY_IN_ACADEMY":
              toast.error("이미 학원에 소속되어 있습니다.");
              break;
            case "TEACHER_HAS_CLASSES":
              toast.error(
                "담당하고 있는 클래스가 있어 학원을 탈퇴할 수 없습니다."
              );
              break;

            // Principal 관련 에러들
            case "PRINCIPAL_NOT_FOUND":
              toast.error("원장 정보를 찾을 수 없습니다.");
              break;
            case "PRINCIPAL_NOT_IN_ACADEMY":
              toast.error("소속된 학원이 없습니다.");
              break;
            case "INSUFFICIENT_PERMISSIONS":
              toast.error("학원 관리 권한이 없습니다.");
              break;

            // 기타 에러들
            case "JOIN_REQUEST_ALREADY_EXISTS":
              toast.error("이미 가입 요청이 진행 중입니다.");
              break;

            default:
              toast.error(userMessage);
          }
        } else {
          toast.error(userMessage);
        }
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
