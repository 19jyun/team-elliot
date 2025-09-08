import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";
import {
  addOptimisticCancellation,
  replaceOptimisticCancellation,
  removeOptimisticCancellation,
} from "@/store/slices/studentSlice";
import { refundApi } from "@/api/refund";
import type { CancellationHistory } from "@/types/api/student";
import { extractErrorMessage } from "@/types/api/error";
import type { CreateRefundRequestDto } from "@/types/api/refund";

export const useRefund = () => {
  const dispatch = useAppDispatch();

  const createRefundRequest = useCallback(
    async (data: CreateRefundRequestDto) => {
      const optimisticCancellation: Omit<CancellationHistory, "id"> & {
        id: string;
        isOptimistic: boolean;
      } = {
        id: `temp_${Date.now()}`,
        sessionId: data.sessionEnrollmentId,
        className: "환불 요청 중...",
        teacherName: "선생님",
        sessionDate: new Date().toISOString().split("T")[0],
        sessionTime: "09:00-10:00",
        refundAmount: data.refundAmount || 0,
        status: "REFUND_REQUESTED" as const,
        reason: data.reason,
        detailedReason: data.detailedReason,
        requestedAt: new Date().toISOString(),
        isOptimistic: true,
      };

      try {
        dispatch(addOptimisticCancellation(optimisticCancellation));

        toast.success("환불 요청을 처리하고 있습니다...", {
          description: "잠시만 기다려주세요.",
        });

        const response = await refundApi.createRefundRequest(data);

        if (response.data && response.data.data && response.data.data.id) {
          const refundData = response.data.data;
          const realCancellation: CancellationHistory = {
            id: refundData.id,
            sessionId: refundData.sessionEnrollmentId,
            className:
              refundData.sessionEnrollment?.session?.class?.className ||
              "클래스명",
            teacherName:
              refundData.sessionEnrollment?.session?.class?.teacher?.name ||
              "선생님",
            sessionDate:
              refundData.sessionEnrollment?.session?.date ||
              new Date().toISOString().split("T")[0],
            sessionTime: `${
              refundData.sessionEnrollment?.session?.startTime || "09:00"
            }-${refundData.sessionEnrollment?.session?.endTime || "10:00"}`,
            refundAmount: refundData.refundAmount,
            status: refundData.status as
              | "REFUND_REQUESTED"
              | "APPROVED"
              | "REJECTED",
            reason: refundData.reason,
            detailedReason: refundData.detailedReason,
            requestedAt: refundData.requestedAt,
            processedAt: refundData.processedAt,
            cancelledAt: refundData.cancelledAt,
          };

          dispatch(
            replaceOptimisticCancellation({
              optimisticId: optimisticCancellation.id,
              realCancellation: {
                ...realCancellation,
                isOptimistic: false,
              },
            })
          );

          toast.success("환불 요청이 완료되었습니다!", {
            description: "승인 대기 중입니다.",
          });

          return response.data;
        } else {
          throw new Error("환불 요청 처리에 실패했습니다.");
        }
      } catch (error: unknown) {
        // 5. 실패 시 낙관적 업데이트 롤백
        dispatch(removeOptimisticCancellation(optimisticCancellation.id));

        toast.error(extractErrorMessage(error, "환불 요청에 실패했습니다."));
        throw error;
      }
    },
    [dispatch]
  );

  const cancelRefundRequest = useCallback(async (refundRequestId: number) => {
    try {
      // 환불 요청 취소는 낙관적 업데이트 없이 바로 처리
      const response = await refundApi.cancelRefundRequest(refundRequestId);

      if (response.data) {
        toast.success("환불 요청이 취소되었습니다.");
        return response.data;
      } else {
        throw new Error("환불 요청 취소에 실패했습니다.");
      }
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "환불 요청 취소에 실패했습니다."));
      throw error;
    }
  }, []);

  return {
    createRefundRequest,
    cancelRefundRequest,
  };
};
