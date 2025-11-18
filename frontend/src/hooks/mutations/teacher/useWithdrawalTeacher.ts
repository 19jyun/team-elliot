import { useMutation } from "@tanstack/react-query";
import { withdrawalTeacher } from "@/api/auth";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  WithdrawalErrorCode,
  isWithdrawalError,
  type WithdrawalErrorDetails,
} from "@/types/withdrawal";
import type { AppError } from "@/types/api";
import type { AxiosError } from "axios";
import type { WithdrawalErrorResponse } from "@/types/withdrawal";

/**
 * Teacher 회원 탈퇴 Mutation
 */
export function useWithdrawalTeacher() {
  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await withdrawalTeacher({ reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("회원 탈퇴가 완료되었습니다");
      logger.info("Teacher 회원 탈퇴 완료", {
        timestamp: new Date().toISOString(),
      });
    },
    onError: (error: unknown) => {
      if (!isWithdrawalError(error)) {
        const axiosError = error as AxiosError<WithdrawalErrorResponse>;
        const errorDetails = {
          error: error instanceof Error ? error.message : String(error),
          errorObject: error,
          response: axiosError.response,
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
        const appError = error as AppError;
        errorCode = appError.code;
        errorMessage = appError.message;
        errorDetails = appError.details as WithdrawalErrorDetails | undefined;
      } else {
        const axiosError = error as AxiosError<WithdrawalErrorResponse>;
        const errorData = axiosError.response?.data;
        errorCode = errorData?.error?.code;
        errorMessage = errorData?.error?.message;
        const errorDetailsRaw = errorData?.error?.details;
        if (errorDetailsRaw && typeof errorDetailsRaw === "object") {
          const detailsObj = errorDetailsRaw as Record<string, unknown>;
          errorDetails = (detailsObj.details ||
            detailsObj) as WithdrawalErrorDetails;
        }
      }

      logger.error("회원 탈퇴 실패", {
        errorCode,
      });

      if (
        errorCode === WithdrawalErrorCode.HAS_ONGOING_CLASSES ||
        errorCode === "HAS_ONGOING_CLASSES"
      ) {
        const classCount = errorDetails?.ongoingClassCount || 0;

        toast.error("진행 중인 수업이 있어 탈퇴할 수 없습니다", {
          description: `${classCount}개의 진행 중인 수업을 먼저 종료해주세요.`,
          duration: 5000,
        });
        return;
      }

      toast.error(errorMessage || "회원 탈퇴 중 오류가 발생했습니다", {
        description: errorMessage ? undefined : "잠시 후 다시 시도해주세요.",
        duration: 4000,
      });
    },
  });
}
