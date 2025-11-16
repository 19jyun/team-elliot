import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updatePrincipalAcademy } from '@/api/principal';
import { toast } from 'sonner';
import type { UpdatePrincipalAcademyRequest, PrincipalAcademy } from '@/types/api/principal';

/**
 * Principal 학원 정보 업데이트 Mutation
 */
export function useUpdatePrincipalAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePrincipalAcademyRequest) => {
      const response = await updatePrincipalAcademy(data);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.principal.academy.detail(),
      });

      const previousAcademy = queryClient.getQueryData<PrincipalAcademy | null>(
        queryKeys.principal.academy.detail()
      );

      // 낙관적 업데이트
      queryClient.setQueryData<PrincipalAcademy | null>(
        queryKeys.principal.academy.detail(),
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      return { previousAcademy };
    },

    // 성공 시
    onSuccess: (data) => {
      // 학원 정보 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.principal.academy.detail(),
        data
      );

      toast.success('학원 정보가 업데이트되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, data, context) => {
      if (context?.previousAcademy) {
        queryClient.setQueryData(
          queryKeys.principal.academy.detail(),
          context.previousAcademy
        );
      }
      toast.error('학원 정보 업데이트에 실패했습니다.');
    },
  });
}

