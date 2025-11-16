import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { rejectTeacherJoinRequest } from '@/api/principal';
import { toast } from 'sonner';
import type { RejectTeacherJoinRequestRequest } from '@/types/api/principal';

/**
 * Principal 선생님 가입 신청 거절 Mutation
 */
export function useRejectTeacherJoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, data }: { requestId: number; data: RejectTeacherJoinRequestRequest }) => {
      const response = await rejectTeacherJoinRequest(requestId, data);
      return response.data;
    },
    
    // 성공 시
    onSuccess: (data, { requestId }) => {
      // 가입 신청 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.teacherJoinRequests.lists(),
      });

      toast.success('선생님 가입 신청이 거절되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('선생님 가입 신청 거절에 실패했습니다.');
    },
  });
}

