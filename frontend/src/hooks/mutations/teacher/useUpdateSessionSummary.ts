import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updateSessionSummary } from '@/api/teacher';
import { toast } from 'sonner';
import type { UpdateSessionSummaryRequest, TeacherSession } from '@/types/api/teacher';

/**
 * Teacher 세션 요약 업데이트 Mutation
 */
export function useUpdateSessionSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: number; data: UpdateSessionSummaryRequest }) => {
      const response = await updateSessionSummary(sessionId, data);
      return response.data;
    },
    
    // 성공 시
    onSuccess: (data, { sessionId }) => {
      // 캘린더 세션 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacher.calendarSessions.lists(),
      });
      
      // 클래스 목록도 무효화 (세션 정보 포함)
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacher.classes.lists(),
      });
      
      // 개별 세션도 업데이트
      queryClient.setQueryData(
        queryKeys.teacher.calendarSessions.detail(sessionId),
        data
      );

      toast.success('세션 요약이 업데이트되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('세션 요약 업데이트에 실패했습니다.');
    },
  });
}

