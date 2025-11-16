import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { rejectPrincipalRefund } from '@/api/principal';
import { toast } from 'sonner';
import type { GetRefundRequestsResponse } from '@/types/api/refund';
import type { RejectRefundRequest } from '@/types/api/principal';

/**
 * Principal 환불 요청 거절 Mutation
 */
export function useRejectRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ refundId, data }: { refundId: number; data: RejectRefundRequest }) => {
      const response = await rejectPrincipalRefund(refundId, data);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async ({ refundId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.principal.refundRequests.lists(),
      });

      const previousRefundRequests = queryClient.getQueryData<GetRefundRequestsResponse>(
        queryKeys.principal.refundRequests.lists()
      );

      // 낙관적 업데이트
      queryClient.setQueryData<GetRefundRequestsResponse>(
        queryKeys.principal.refundRequests.lists(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            refundRequests: old.refundRequests.map(refund =>
              refund.id === refundId
                ? { ...refund, status: 'REJECTED' }
                : refund
            ),
          };
        }
      );

      return { previousRefundRequests };
    },

    // 성공 시
    onSuccess: (data, { refundId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.refundRequests.lists(),
      });
      
      queryClient.setQueryData(
        queryKeys.principal.refundRequests.detail(refundId),
        data
      );
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.cancellationHistory.lists(),
      });

      toast.success('환불 요청이 거절되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, { refundId }, context) => {
      if (context?.previousRefundRequests) {
        queryClient.setQueryData(
          queryKeys.principal.refundRequests.lists(),
          context.previousRefundRequests
        );
      }
      toast.error('환불 요청 거절에 실패했습니다.');
    },
  });
}

