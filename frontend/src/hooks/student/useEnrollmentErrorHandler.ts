import { useCallback } from "react";
import { toast } from "sonner";
import type { StudentBatchEnrollSessionsResponse } from "@/types/api/student";
import type { SelectedSession } from "@/components/features/student/enrollment/month/date/payment/types";
import type { EnrollmentStep } from "@/contexts/forms/EnrollmentFormManager";

interface UseEnrollmentErrorHandlerProps {
  setEnrollmentStep: (step: EnrollmentStep) => void;
}

export const useEnrollmentErrorHandler = ({
  setEnrollmentStep,
}: UseEnrollmentErrorHandlerProps) => {
  // 에러 메시지 매핑
  const getErrorMessage = useCallback(
    (error: Error): { message: string; shouldGoBack: boolean } => {
      if (error.message.includes("ALREADY_ENROLLED")) {
        return {
          message:
            "이미 수강 신청한 세션이 포함되어 있습니다. 다시 선택해주세요.",
          shouldGoBack: true,
        };
      }

      if (error.message.includes("SESSION_FULL")) {
        return {
          message: "선택한 세션 중 가득 찬 세션이 있습니다. 다시 선택해주세요.",
          shouldGoBack: true,
        };
      }

      if (error.message.includes("SESSION_PAST_START_TIME")) {
        return {
          message:
            "선택한 세션 중 시작 시간이 지난 세션이 있습니다. 다시 선택해주세요.",
          shouldGoBack: true,
        };
      }

      if (error.message.includes("SESSION_NOT_FOUND")) {
        return {
          message:
            "선택한 세션 중 존재하지 않는 세션이 있습니다. 다시 선택해주세요.",
          shouldGoBack: true,
        };
      }

      if (error.message.includes("수강신청할 세션을 선택해주세요")) {
        return {
          message: error.message,
          shouldGoBack: true,
        };
      }

      return {
        message: error.message || "처리 중 오류가 발생했습니다.",
        shouldGoBack: false,
      };
    },
    []
  );

  // 부분 실패 처리
  const handlePartialFailure = useCallback(
    (
      result: StudentBatchEnrollSessionsResponse,
      selectedSessions: SelectedSession[]
    ): { shouldProceed: boolean; message?: string } => {
      const { success, enrolledSessions, failedSessions } = result;

      if (failedSessions && failedSessions.length > 0) {
        const failedSessionIds = failedSessions.map((f) => f.sessionId);
        const failedSessionNames = selectedSessions
          .filter((s) => failedSessionIds.includes(s.id))
          .map((s) => s.class?.className || `세션 ${s.id}`)
          .join(", ");

        if (success && enrolledSessions && enrolledSessions.length > 0) {
          // 일부 성공한 경우
          toast.success(
            `${enrolledSessions.length}개 수강신청이 완료되었습니다!`,
            {
              description: `${failedSessions.length}개는 처리에 실패했습니다: ${failedSessionNames}`,
            }
          );
          return { shouldProceed: true };
        } else {
          // 모든 세션 실패한 경우
          toast.error("모든 세션 수강신청에 실패했습니다. 다시 시도해주세요.");
          return { shouldProceed: false };
        }
      }

      // 모든 세션 성공한 경우
      toast.success("수강신청이 완료되었습니다!", {
        description: "승인 대기 중입니다.",
      });
      return { shouldProceed: true };
    },
    []
  );

  // 에러 처리
  const handleError = useCallback(
    (error: unknown): boolean => {
      console.error("Enrollment error:", error);

      if (error instanceof Error) {
        const { message, shouldGoBack } = getErrorMessage(error);

        toast.error(message);

        if (shouldGoBack) {
          setEnrollmentStep("date-selection");
          return false; // 진행하지 않음
        }
      } else {
        toast.error("처리 중 오류가 발생했습니다.");
      }

      return false; // 에러 발생 시 진행하지 않음
    },
    [getErrorMessage, setEnrollmentStep]
  );

  return {
    handlePartialFailure,
    handleError,
  };
};
