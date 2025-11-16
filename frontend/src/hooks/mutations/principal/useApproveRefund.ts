import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { approvePrincipalRefund } from '@/api/principal';
import { toast } from 'sonner';
import type { GetRefundRequestsResponse } from '@/types/api/refund';

/**
 * Principal 환불 요청 승인 Mutation
 */
export function useApproveRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refundId: number) => {
      const response = await approvePrincipalRefund(refundId);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (refundId) => {
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
                ? { ...refund, status: 'APPROVED' }
                : refund
            ),
          };
        }
      );

      return { previousRefundRequests };
    },

    // 성공 시
    onSuccess: (data, refundId) => {
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
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.calendarSessions.lists(),
      });

      toast.success('환불 요청이 승인되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, refundId, context) => {
      if (context?.previousRefundRequests) {
        queryClient.setQueryData(
          queryKeys.principal.refundRequests.lists(),
          context.previousRefundRequests
        );
      }
      toast.error('환불 요청 승인에 실패했습니다.');
    },
  });
}

