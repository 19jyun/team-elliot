import { useCallback } from "react";
import { toast } from "sonner";
import type { StudentBatchModifyEnrollmentsResponse } from "@/types/api/student";
import type { ModificationSessionVM } from "@/types/view/student";
import type { EnrollmentStep } from "@/contexts/forms/EnrollmentFormManager";

interface UseModificationErrorHandlerProps {
  onRetry?: () => void;
  setEnrollmentStep?: (step: EnrollmentStep) => void;
}

export const useModificationErrorHandler = ({
  onRetry,
  setEnrollmentStep,
}: UseModificationErrorHandlerProps) => {
  // 에러 메시지 매핑
  const getErrorMessage = useCallback(
    (error: Error): { message: string; shouldGoBack: boolean } => {
      if (
        error.message.includes("UNAUTHORIZED") ||
        error.message.includes("401")
      ) {
        return {
          message: "인증이 필요합니다. 다시 로그인해주세요.",
          shouldGoBack: true,
        };
      } else if (
        error.message.includes("FORBIDDEN") ||
        error.message.includes("403")
      ) {
        return {
          message: "수강 변경 권한이 없습니다.",
          shouldGoBack: true,
        };
      } else if (
        error.message.includes("NOT_FOUND") ||
        error.message.includes("404")
      ) {
        return {
          message: "수강 변경할 세션을 찾을 수 없습니다.",
          shouldGoBack: true,
        };
      } else if (
        error.message.includes("NETWORK") ||
        error.message.includes("fetch")
      ) {
        return {
          message: "네트워크 연결을 확인해주세요.",
          shouldGoBack: false,
        };
      } else if (error.message.includes("VALIDATION")) {
        return {
          message: "선택한 세션 정보가 올바르지 않습니다.",
          shouldGoBack: false,
        };
      } else if (error.message.includes("SESSION_NOT_FOUND")) {
        return {
          message: "해당 세션을 찾을 수 없습니다.",
          shouldGoBack: true,
        };
      } else if (error.message.includes("SESSION_PAST_START_TIME")) {
        return {
          message: "이미 시작된 세션은 변경할 수 없습니다.",
          shouldGoBack: false,
        };
      } else if (error.message.includes("SESSION_FULL")) {
        return {
          message: "선택한 세션 중 가득 찬 세션이 있습니다.",
          shouldGoBack: false,
        };
      } else if (error.message.includes("STUDENT_NOT_FOUND")) {
        return {
          message: "학생 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
          shouldGoBack: true,
        };
      } else if (error.message.includes("ENROLLMENT_NOT_FOUND")) {
        return {
          message: "수강 신청 정보를 찾을 수 없습니다.",
          shouldGoBack: true,
        };
      } else if (error.message.includes("ALREADY_CANCELLED")) {
        return {
          message: "이미 취소된 수강 신청입니다.",
          shouldGoBack: false,
        };
      } else if (error.message.includes("CANCELLATION_NOT_ALLOWED")) {
        return {
          message: "이미 시작된 수업은 취소할 수 없습니다.",
          shouldGoBack: false,
        };
      } else if (error.message.includes("ENROLLMENT_ALREADY_EXISTS")) {
        return {
          message: "이미 수강 신청한 세션입니다.",
          shouldGoBack: false,
        };
      }

      return {
        message: error.message || "수강 변경 중 오류가 발생했습니다.",
        shouldGoBack: false,
      };
    },
    []
  );

  // 에러 처리
  const handleError = useCallback(
    (error: unknown): boolean => {
      console.error("Modification error:", error);

      let errorInfo: { message: string; shouldGoBack: boolean };

      if (error instanceof Error) {
        errorInfo = getErrorMessage(error);
      } else {
        errorInfo = {
          message: "알 수 없는 오류가 발생했습니다.",
          shouldGoBack: false,
        };
      }

      // 토스트 메시지 표시
      toast.error(errorInfo.message);

      return !errorInfo.shouldGoBack; // shouldGoBack이 true면 false 반환 (처리 중단)
    },
    [getErrorMessage]
  );

  // 부분 실패 처리 (수강 변경 특화)
  const handlePartialModificationFailure = useCallback(
    (
      result: StudentBatchModifyEnrollmentsResponse,
      selectedSessions: ModificationSessionVM[]
    ): { shouldProceed: boolean; message?: string } => {
      const {
        success,
        cancelledSessions,
        newlyEnrolledSessions,
        failedOperations,
      } = result;

      if (failedOperations && failedOperations.length > 0) {
        const failedSessionIds = failedOperations.map((f) => f.sessionId);
        const failedSessionNames = selectedSessions
          .filter((s) => failedSessionIds.includes(s.id))
          .map((s) => s.class.className || `세션 ${s.id}`)
          .join(", ");

        if (
          success &&
          (cancelledSessions.length > 0 || newlyEnrolledSessions.length > 0)
        ) {
          // 일부 성공한 경우
          const successCount =
            cancelledSessions.length + newlyEnrolledSessions.length;
          const failCount = failedOperations.length;

          toast.success(`${successCount}개 수강 변경이 완료되었습니다!`, {
            description: `${failCount}개는 처리에 실패했습니다: ${failedSessionNames}`,
          });
          return { shouldProceed: true };
        } else {
          // 모든 변경 실패한 경우
          toast.error("모든 수강 변경에 실패했습니다. 다시 시도해주세요.");
          return { shouldProceed: false };
        }
      }

      // 모든 변경 성공한 경우
      toast.success("수강 변경이 완료되었습니다!", {
        description: "변경 사항이 적용되었습니다.",
      });
      return { shouldProceed: true };
    },
    []
  );

  // 수강 변경 특화 에러 처리
  const handleModificationError = useCallback(
    (error: unknown): boolean => {
      console.error("Modification error:", error);

      let errorInfo: { message: string; shouldGoBack: boolean };

      if (error instanceof Error) {
        errorInfo = getErrorMessage(error);
      } else {
        errorInfo = {
          message: "알 수 없는 오류가 발생했습니다.",
          shouldGoBack: false,
        };
      }

      // 토스트 메시지 표시
      toast.error(errorInfo.message);

      // shouldGoBack이 true면 이전 단계로 이동
      if (errorInfo.shouldGoBack && setEnrollmentStep) {
        setEnrollmentStep("date-selection");
      }

      return !errorInfo.shouldGoBack; // shouldGoBack이 true면 false 반환 (처리 중단)
    },
    [getErrorMessage, setEnrollmentStep]
  );

  // 재시도 처리
  const handleRetry = useCallback(() => {
    if (onRetry) {
      toast.info("수강 변경 세션을 다시 불러오는 중...");
      onRetry();
    } else {
      toast.info("페이지를 새로고침합니다...");
      window.location.reload();
    }
  }, [onRetry]);

  return {
    handleError,
    handleRetry,
    handleModificationError,
    handlePartialModificationFailure,
  };
};
