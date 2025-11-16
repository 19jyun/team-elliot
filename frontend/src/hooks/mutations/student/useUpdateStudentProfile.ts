import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { updateMyProfile } from '@/api/student';
import { toast } from 'sonner';
import type { UpdateStudentProfileRequest, StudentProfile } from '@/types/api/student';

/**
 * Student 프로필 업데이트 Mutation
 */
export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStudentProfileRequest) => {
      const response = await updateMyProfile(data);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.student.profile.detail(),
      });

      const previousProfile = queryClient.getQueryData<StudentProfile | null>(
        queryKeys.student.profile.detail()
      );

      // 낙관적 업데이트
      queryClient.setQueryData<StudentProfile | null>(
        queryKeys.student.profile.detail(),
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
        queryKeys.student.profile.detail(),
        data
      );

      toast.success('프로필이 업데이트되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, data, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.student.profile.detail(),
          context.previousProfile
        );
      }
      toast.error('프로필 업데이트에 실패했습니다.');
    },
  });
}

