import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updateRefundAccount } from '@/api/student';
import { toast } from 'sonner';
import type { UpdateStudentRefundAccountRequest, StudentRefundAccount } from '@/types/api/student';

/**
 * Student 환불 계좌 업데이트 Mutation
 */
export function useUpdateStudentRefundAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStudentRefundAccountRequest) => {
      const response = await updateRefundAccount(data);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.student.refundAccount.detail(),
      });

      const previousRefundAccount = queryClient.getQueryData<StudentRefundAccount | null>(
        queryKeys.student.refundAccount.detail()
      );

      // 낙관적 업데이트
      queryClient.setQueryData<StudentRefundAccount | null>(
        queryKeys.student.refundAccount.detail(),
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      return { previousRefundAccount };
    },

    // 성공 시
    onSuccess: (data) => {
      // 환불 계좌 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.student.refundAccount.detail(),
        data
      );

      toast.success('환불 계좌 정보가 업데이트되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, data, context) => {
      if (context?.previousRefundAccount) {
        queryClient.setQueryData(
          queryKeys.student.refundAccount.detail(),
          context.previousRefundAccount
        );
      }
      toast.error('환불 계좌 정보 업데이트에 실패했습니다.');
    },
  });
}

