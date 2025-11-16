import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { refundApi } from "@/api/refund";
import { toast } from "sonner";
import type {
  CreateRefundRequestDto,
  RefundRequestResponse,
} from "@/types/api/refund";

/**
 * Student 환불 요청 생성 Mutation
 */
export function useCreateRefundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateRefundRequestDto
    ): Promise<RefundRequestResponse> => {
      const response = await refundApi.createRefundRequest(data);
      return response.data!;
    },

    // 성공 시
    onSuccess: () => {
      // 관련 쿼리 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.enrollmentHistory.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.student.cancellationHistory.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.student.calendarSessions.lists(),
      });

      // Principal 측 캐시도 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.refundRequests.lists(),
      });

      toast.success("환불 요청이 완료되었습니다.");
    },

    // 에러 시
    onError: (error) => {
      toast.error("환불 요청에 실패했습니다.");
    },
  });
}
