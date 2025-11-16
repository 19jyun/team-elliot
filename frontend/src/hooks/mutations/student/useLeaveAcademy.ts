import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { leaveAcademy } from '@/api/student';
import { toast } from 'sonner';
import type { StudentLeaveAcademyRequest } from '@/types/api/student';

/**
 * Student 학원 탈퇴 Mutation
 */
export function useLeaveAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentLeaveAcademyRequest) => {
      const response = await leaveAcademy(data);
      return response.data;
    },
    
    // 성공 시
    onSuccess: () => {
      // 학원 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.academies.lists(),
      });
      
      // 수강 내역도 무효화 (학원 탈퇴 시 관련 데이터 변경)
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.enrollmentHistory.lists(),
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.calendarSessions.lists(),
      });

      toast.success('학원 탈퇴가 완료되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('학원 탈퇴에 실패했습니다.');
    },
  });
}

