import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { updateTeacherProfilePhoto } from "@/api/teacher";
import { toast } from "sonner";

/**
 * Teacher 프로필 사진 업데이트 Mutation
 */
export function useUpdateTeacherProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: File) => {
      const response = await updateTeacherProfilePhoto(photo);
      return response.data;
    },

    // 성공 시
    onSuccess: (data) => {
      // 프로필 캐시 업데이트
      queryClient.setQueryData(queryKeys.teacher.profile.detail(), data);

      toast.success("프로필 사진이 업데이트되었습니다.");
    },

    // 에러 시
    onError: () => {
      toast.error("프로필 사진 업데이트에 실패했습니다.");
    },
  });
}
