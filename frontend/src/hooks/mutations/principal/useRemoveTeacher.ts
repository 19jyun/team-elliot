import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { removePrincipalTeacher } from '@/api/principal';
import { toast } from 'sonner';
import type { PrincipalTeacher } from '@/types/api/principal';

/**
 * Principal 선생님 제거 Mutation
 */
export function useRemoveTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherId: number) => {
      const response = await removePrincipalTeacher(teacherId);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (teacherId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.principal.teachers.lists(),
      });

      const previousTeachers = queryClient.getQueryData<PrincipalTeacher[]>(
        queryKeys.principal.teachers.lists()
      );

      // 낙관적 업데이트 (제거)
      queryClient.setQueryData<PrincipalTeacher[]>(
        queryKeys.principal.teachers.lists(),
        (old) => {
          if (!old) return old;
          return old.filter(teacher => teacher.id !== teacherId);
        }
      );

      return { previousTeachers };
    },

    // 성공 시
    onSuccess: (data, teacherId) => {
      // 선생님 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.teachers.lists(),
      });
      
      // 개별 항목 제거
      queryClient.removeQueries({
        queryKey: queryKeys.principal.teachers.detail(teacherId),
      });

      toast.success('선생님이 학원에서 제거되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, teacherId, context) => {
      if (context?.previousTeachers) {
        queryClient.setQueryData(
          queryKeys.principal.teachers.lists(),
          context.previousTeachers
        );
      }
      toast.error('선생님 제거에 실패했습니다.');
    },
  });
}

