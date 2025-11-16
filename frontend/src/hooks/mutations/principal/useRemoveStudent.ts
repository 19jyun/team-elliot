import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { removePrincipalStudent } from '@/api/principal';
import { toast } from 'sonner';
import type { PrincipalStudent } from '@/types/api/principal';

/**
 * Principal 학생 제거 Mutation
 */
export function useRemoveStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: number) => {
      const response = await removePrincipalStudent(studentId);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (studentId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.principal.students.lists(),
      });

      const previousStudents = queryClient.getQueryData<PrincipalStudent[]>(
        queryKeys.principal.students.lists()
      );

      // 낙관적 업데이트 (제거)
      queryClient.setQueryData<PrincipalStudent[]>(
        queryKeys.principal.students.lists(),
        (old) => {
          if (!old) return old;
          return old.filter(student => student.id !== studentId);
        }
      );

      return { previousStudents };
    },

    // 성공 시
    onSuccess: (data, studentId) => {
      // 학생 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.students.lists(),
      });
      
      // 개별 항목 제거
      queryClient.removeQueries({
        queryKey: queryKeys.principal.students.detail(studentId),
      });

      toast.success('학생이 학원에서 제거되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, studentId, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(
          queryKeys.principal.students.lists(),
          context.previousStudents
        );
      }
      toast.error('학생 제거에 실패했습니다.');
    },
  });
}

