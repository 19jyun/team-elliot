import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { batchEnrollSessions } from '@/api/student';
import { toast } from 'sonner';
import type { StudentBatchEnrollSessionsRequest } from '@/types/api/student';

/**
 * Student 배치 수강 신청 Mutation
 */
export function useBatchEnrollSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentBatchEnrollSessionsRequest) => {
      const response = await batchEnrollSessions(data);
      return response.data;
    },
    
    // 성공 시
    onSuccess: () => {
      // 관련 쿼리 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.enrollmentHistory.lists(),
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.calendarSessions.lists(),
      });
      
      // 수강 가능한 세션도 무효화 (수강 신청 후 변경됨)
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.availableSessions.lists(),
      });
      
      // Principal 측 캐시도 무효화 (수강신청 목록)
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.enrollments.lists(),
      });

      toast.success('수강 신청이 완료되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('수강 신청에 실패했습니다.');
    },
  });
}

