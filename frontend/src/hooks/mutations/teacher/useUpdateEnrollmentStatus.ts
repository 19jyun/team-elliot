import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updateEnrollmentStatus } from '@/api/teacher';
import { toast } from 'sonner';
import type { UpdateEnrollmentStatusRequest } from '@/types/api/teacher';

/**
 * Teacher 수강생 상태 업데이트 Mutation
 */
export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enrollmentId, data }: { enrollmentId: number; data: UpdateEnrollmentStatusRequest }) => {
      const response = await updateEnrollmentStatus(enrollmentId, data);
      return response.data;
    },
    
    // 성공 시
    onSuccess: (data, { enrollmentId }) => {
      // 세션 수강생 목록 무효화 (모든 세션)
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === 'principal' && 
          query.queryKey[1] === 'sessionEnrollments',
      });
      
      // 학생 측 캐시도 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.enrollmentHistory.lists(),
      });

      toast.success('수강생 상태가 업데이트되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('수강생 상태 업데이트에 실패했습니다.');
    },
  });
}

