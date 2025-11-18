import { useMutation } from "@tanstack/react-query";
import { withdrawalPrincipal } from "@/api/auth";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  WithdrawalErrorCode,
  isWithdrawalError,
  type WithdrawalErrorDetails,
} from "@/types/withdrawal";

/**
 * Principal 회원 탈퇴 Mutation
 */
export function useWithdrawalPrincipal() {
  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await withdrawalPrincipal({ reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("회원 탈퇴가 완료되었습니다");
      logger.info("Principal 회원 탈퇴 완료", {
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

      // 에러 파싱 (AppError 또는 AxiosError 형태)
      let errorCode: string | undefined;
      let errorMessage: string | undefined;
      let errorDetails: WithdrawalErrorDetails | undefined;

      // AppError 형태인지 확인 (apiClient 인터셉터가 변환한 경우)
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
        const errorData = error.response?.data;
        errorCode = errorData?.error?.code;
        errorMessage = errorData?.error?.message;
        const errorDetailsRaw = errorData?.error?.details as any;
        errorDetails = (errorDetailsRaw?.details ||
          errorDetailsRaw) as WithdrawalErrorDetails;
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

      if (
        errorCode === WithdrawalErrorCode.HAS_PENDING_REFUNDS ||
        errorCode === "HAS_PENDING_REFUNDS"
      ) {
        const refundCount = errorDetails?.pendingRefundCount || 0;

        toast.error("처리되지 않은 환불 요청이 있습니다", {
          description: `${refundCount}개의 환불 요청을 먼저 처리해주세요.`,
          duration: 5000,
        });
        return;
      }

      if (
        errorCode === WithdrawalErrorCode.HAS_PENDING_ENROLLMENTS ||
        errorCode === "HAS_PENDING_ENROLLMENTS"
      ) {
        const enrollmentCount = errorDetails?.pendingEnrollmentCount || 0;

        toast.error("처리되지 않은 수강 신청이 있습니다", {
          description: `${enrollmentCount}개의 수강 신청을 먼저 처리해주세요.`,
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
