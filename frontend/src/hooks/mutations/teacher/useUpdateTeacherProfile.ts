import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updateTeacherProfile } from '@/api/teacher';
import { toast } from 'sonner';
import type { UpdateProfileRequest, TeacherProfileResponse } from '@/types/api/teacher';

/**
 * Teacher 프로필 업데이트 Mutation
 */
export function useUpdateTeacherProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await updateTeacherProfile(data);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.teacher.profile.detail(),
      });

      const previousProfile = queryClient.getQueryData<TeacherProfileResponse | null>(
        queryKeys.teacher.profile.detail()
      );

      // 낙관적 업데이트
      queryClient.setQueryData<TeacherProfileResponse | null>(
        queryKeys.teacher.profile.detail(),
        (old) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      return { previousProfile };
    },

    // 성공 시
    onSuccess: (data) => {
      // 프로필 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.teacher.profile.detail(),
        data
      );

      toast.success('프로필이 업데이트되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, data, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.teacher.profile.detail(),
          context.previousProfile
        );
      }
      toast.error('프로필 업데이트에 실패했습니다.');
    },
  });
}

