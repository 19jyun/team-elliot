import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updatePrincipalProfilePhoto } from '@/api/principal';
import { toast } from 'sonner';
import type { PrincipalProfile } from '@/types/api/principal';

/**
 * Principal 프로필 사진 업데이트 Mutation
 */
export function useUpdatePrincipalProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: File) => {
      const response = await updatePrincipalProfilePhoto(photo);
      return response.data;
    },
    
    // 성공 시
    onSuccess: (data) => {
      // 프로필 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.principal.profile.detail(),
        data
      );

      toast.success('프로필 사진이 업데이트되었습니다.');
    },

    // 에러 시
    onError: (error) => {
      toast.error('프로필 사진 업데이트에 실패했습니다.');
    },
  });
}

