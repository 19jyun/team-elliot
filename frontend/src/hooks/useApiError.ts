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

            // Ballet Pose 관련 에러들
            case "BALLET_POSE_NOT_FOUND":
              toast.error("존재하지 않는 발레 자세입니다.");
              break;
            case "BALLET_POSE_NAME_ALREADY_EXISTS":
              setFieldErrors({ name: "이미 존재하는 발레 자세명입니다." });
              break;
            case "BALLET_POSE_IN_USE":
              toast.error("세션에서 사용 중인 발레 자세는 삭제할 수 없습니다.");
              break;
            case "INVALID_DIFFICULTY":
              toast.error("유효하지 않은 난이도입니다.");
              break;

            // Class 관련 에러들
            case "CLASS_NOT_FOUND":
              toast.error("존재하지 않는 클래스입니다.");
              break;
            case "CLASS_FULL":
              toast.error("클래스 정원이 초과되었습니다.");
              break;
            case "CLASS_HAS_STUDENTS":
              toast.error("수강생이 있는 클래스는 삭제할 수 없습니다.");
              break;
            case "ALREADY_ENROLLED":
              toast.error("이미 수강 신청한 클래스입니다.");
              break;
            case "ENROLLMENT_NOT_FOUND":
              toast.error("수강 신청 내역을 찾을 수 없습니다.");
              break;
            case "INVALID_CLASS_DATES":
              toast.error("시작일은 종료일보다 이전이어야 합니다.");
              break;
            case "INVALID_DAY_OF_WEEK":
              toast.error("유효하지 않은 요일입니다.");
              break;
            case "INVALID_LEVEL":
              toast.error("유효하지 않은 레벨입니다.");
              break;

            // Class Session 관련 에러들
            case "SESSION_NOT_FOUND":
              toast.error("존재하지 않는 세션입니다.");
              break;
            case "SESSION_FULL":
              toast.error("세션 정원이 초과되었습니다.");
              break;
            case "SESSION_HAS_ENROLLMENTS":
              toast.error("수강생이 있는 세션은 삭제할 수 없습니다.");
              break;
            case "SESSION_ALREADY_STARTED":
              toast.error("이미 시작된 수업은 신청할 수 없습니다.");
              break;
            case "ENROLLMENT_NOT_FOUND":
              toast.error("수강 신청 내역을 찾을 수 없습니다.");
              break;
            case "ALREADY_ENROLLED":
              toast.error("이미 수강 신청한 세션입니다.");
              break;
            case "ATTENDANCE_CHECK_INVALID_DATE":
              toast.error("출석 체크는 수업 당일에만 가능합니다.");
              break;
            case "ENROLLMENT_ALREADY_CANCELLED":
              toast.error("이미 취소된 수강 신청입니다.");
              break;
            case "ENROLLMENT_CANNOT_CANCEL":
              toast.error("수업이 이미 시작되어 취소할 수 없습니다.");
              break;
            case "ENROLLMENT_ALREADY_PROCESSED":
              toast.error("이미 처리된 수강 신청입니다.");
              break;

            // Principal 관련 에러들
            case "PRINCIPAL_NOT_FOUND":
              toast.error("Principal을 찾을 수 없습니다.");
              break;

            // Refund 관련 에러들
            case "REFUND_REQUEST_NOT_FOUND":
              toast.error("환불 요청을 찾을 수 없습니다.");
              break;
            case "REFUND_REQUEST_ALREADY_EXISTS":
              toast.error("이미 환불 요청이 진행 중입니다.");
              break;
            case "REFUND_REQUEST_NOT_PENDING":
              toast.error("대기 중인 환불 요청만 처리할 수 있습니다.");
              break;
            case "SESSION_ENROLLMENT_NOT_FOUND":
              toast.error("세션 수강 신청을 찾을 수 없습니다.");
              break;

            // Rejection Detail 관련 에러들
            case "REJECTION_DETAIL_NOT_FOUND":
              toast.error("거절 상세 정보를 찾을 수 없습니다.");
              break;
            case "REJECTION_DETAIL_ALREADY_EXISTS":
              toast.error("이미 거절 상세 정보가 존재합니다.");
              break;
            case "REJECTOR_NOT_FOUND":
              toast.error("거절 처리자를 찾을 수 없습니다.");
              break;
            case "ENTITY_NOT_FOUND":
              toast.error("거절 대상 엔티티를 찾을 수 없습니다.");
              break;

            // Session Content 관련 에러들
            case "SESSION_CONTENT_NOT_FOUND":
              toast.error("세션 내용을 찾을 수 없습니다.");
              break;
            case "INVALID_CONTENT_IDS":
              toast.error("유효하지 않은 세션 내용 ID가 포함되어 있습니다.");
              break;

            // Socket 관련 에러들
            case "INVALID_USER_ID":
              toast.error("유효하지 않은 사용자 ID입니다.");
              break;
            case "INVALID_ACADEMY_ID":
              toast.error("유효하지 않은 학원 ID입니다.");
              break;
            case "INVALID_CLASS_ID":
              toast.error("유효하지 않은 클래스 ID입니다.");
              break;
            case "INVALID_ROLE":
              toast.error("유효하지 않은 역할입니다.");
              break;
            case "INVALID_EVENT_NAME":
              toast.error("유효하지 않은 이벤트 이름입니다.");
              break;
            case "INVALID_EVENTS_ARRAY":
              toast.error("유효하지 않은 이벤트 배열입니다.");
              break;
            case "INVALID_TARGET":
              toast.error("유효하지 않은 타겟입니다.");
              break;
            case "INVALID_TARGET_FORMAT":
              toast.error("유효하지 않은 타겟 형식입니다.");
              break;
            case "UNKNOWN_TARGET_TYPE":
              toast.error("알 수 없는 타겟 타입입니다.");
              break;
            case "TOKEN_MISSING":
              toast.error("인증 토큰이 없습니다.");
              break;
            case "INVALID_TOKEN_FORMAT":
              toast.error("유효하지 않은 토큰 형식입니다.");
              break;
            case "INVALID_TOKEN":
              toast.error("유효하지 않은 토큰입니다.");
              break;
            case "INCOMPLETE_TOKEN":
              toast.error("토큰에 필수 정보가 누락되었습니다.");
              break;
            case "USER_NOT_FOUND":
              toast.error("사용자 정보를 찾을 수 없습니다.");
              break;
            case "UNKNOWN_ROLE":
              toast.error("알 수 없는 역할입니다.");
              break;

            // Student 관련 에러들
            case "STUDENT_NOT_FOUND":
              toast.error("학생을 찾을 수 없습니다.");
              break;
            case "CLASS_NOT_FOUND":
              toast.error("수업을 찾을 수 없습니다.");
              break;
            case "SESSION_NOT_FOUND":
              toast.error("세션을 찾을 수 없습니다.");
              break;
            case "NOT_ACADEMY_MEMBER":
              toast.error("해당 학원에 가입되어 있지 않습니다.");
              break;
            case "SESSION_ALREADY_PASSED":
              toast.error("이미 지난 세션입니다.");
              break;
            case "ALREADY_ENROLLED":
              toast.error("이미 수강 신청한 세션입니다.");
              break;
            case "PRINCIPAL_NOT_FOUND":
              toast.error("Principal을 찾을 수 없습니다.");
              break;
            case "NOT_AUTHORIZED":
              toast.error("해당 수강생에 접근할 권한이 없습니다.");
              break;

            // Teacher 관련 에러들
            case "TEACHER_NOT_FOUND":
              toast.error("선생님을 찾을 수 없습니다.");
              break;
            case "ACADEMY_NOT_FOUND":
              toast.error("학원을 찾을 수 없습니다.");
              break;
            case "FORBIDDEN_ACCESS":
              toast.error("해당 강사에 접근할 권한이 없습니다.");
              break;
            case "BAD_REQUEST":
              toast.error("잘못된 요청입니다.");
              break;

            // 이미지 관련 에러들
            case "INVALID_IMAGE_FORMAT":
              toast.error(
                "지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP만 가능)"
              );
              break;
            case "IMAGE_TOO_LARGE":
              toast.error("이미지 크기가 너무 큽니다. (5MB 이하만 가능)");
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
