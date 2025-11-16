import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { batchModifyEnrollments } from '@/api/student';
import { toast } from 'sonner';
import type { StudentBatchModifyEnrollmentsRequest } from '@/types/api/student';

/**
 * Student 배치 수강 변경 Mutation
 */
export function useBatchModifyEnrollments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentBatchModifyEnrollmentsRequest) => {
      const response = await batchModifyEnrollments(data);
      return response.data;
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
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.availableSessions.lists(),
      });
      
      // Principal 측 캐시도 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.enrollments.lists(),
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.refundRequests.lists(),
      });

      toast.success('수강 변경이 완료되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('수강 변경에 실패했습니다.');
    },
  });
}

