import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updateClassDetails } from '@/api/teacher';
import { toast } from 'sonner';
import type { UpdateClassDetailsRequest, TeacherClass } from '@/types/api/teacher';

/**
 * Teacher 클래스 상세 정보 업데이트 Mutation
 */
export function useUpdateClassDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, data }: { classId: number; data: UpdateClassDetailsRequest }) => {
      const response = await updateClassDetails(classId, data);
      return response.data;
    },
    
    // 성공 시
    onSuccess: (data, { classId }) => {
      // 클래스 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacher.classes.lists(),
      });
      
      // 개별 클래스도 업데이트
      if (data) {
        queryClient.setQueryData(
          queryKeys.teacher.classes.detail(classId),
          data
        );
      }

      toast.success('클래스 정보가 업데이트되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('클래스 정보 업데이트에 실패했습니다.');
    },
  });
}

