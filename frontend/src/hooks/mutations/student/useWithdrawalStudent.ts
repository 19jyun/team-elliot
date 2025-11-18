import { useMutation } from "@tanstack/react-query";
import { withdrawalStudent } from "@/api/auth";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  WithdrawalErrorCode,
  isWithdrawalError,
  type WithdrawalErrorDetails,
} from "@/types/withdrawal";

/**
 * Student 회원 탈퇴 Mutation
 */
export function useWithdrawalStudent() {
  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await withdrawalStudent({ reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("회원 탈퇴가 완료되었습니다");
      logger.info("Student 회원 탈퇴 완료", {
        timestamp: new Date().toISOString(),
      });
    },
    onError: (error: unknown) => {
      // 타입 가드를 사용하여 에러 구조 확인
      if (!isWithdrawalError(error)) {
        // 예상치 못한 에러 (네트워크 에러 등)
        const errorDetails = {
          error: error instanceof Error ? error.message : String(error),
          errorObject: error,
          response: (error as any)?.response,
          stack: error instanceof Error ? error.stack : undefined,
        };

        logger.error("회원 탈퇴 실패 (예상치 못한 에러)", errorDetails);

        toast.error("회원 탈퇴 중 오류가 발생했습니다", {
          description: "잠시 후 다시 시도해주세요.",
          duration: 4000,
        });
        return;
      }

      let errorCode: string | undefined;
      let errorMessage: string | undefined;
      let errorDetails: WithdrawalErrorDetails | undefined;

      if (
        error &&
        typeof error === "object" &&
        "type" in error &&
        "code" in error &&
        "message" in error
      ) {
        const appError = error as any;
        errorCode = appError.code;
        errorMessage = appError.message;
        errorDetails = appError.details as WithdrawalErrorDetails | undefined;
      } else {
        const errorData = (error as any).response?.data;
        errorCode = errorData?.error?.code;
        errorMessage = errorData?.error?.message;
        const errorDetailsRaw = errorData?.error?.details as any;
        errorDetails = (errorDetailsRaw?.details ||
          errorDetailsRaw) as WithdrawalErrorDetails;
      }

      logger.error("회원 탈퇴 실패", {
        errorCode,
      });

      switch (errorCode) {
        default:
          // 백엔드 에러 메시지 표시
          toast.error(errorMessage || "회원 탈퇴 중 오류가 발생했습니다", {
            description: errorMessage
              ? undefined
              : "잠시 후 다시 시도해주세요.",
            duration: 4000,
          });
          break;
      }
    },
  });
}
