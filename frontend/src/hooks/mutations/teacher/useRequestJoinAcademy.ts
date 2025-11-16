import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { requestJoinAcademy } from "@/api/teacher";
import { toast } from "sonner";
import type { RequestJoinAcademyRequest } from "@/types/api/teacher";

/**
 * Teacher 학원 가입 요청 Mutation
 */
export function useRequestJoinAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RequestJoinAcademyRequest) => {
      const response = await requestJoinAcademy(data);
      return response.data;
    },
    onSuccess: () => {
      // 학원 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacher.academy.all,
      });
      toast.success("학원 가입 요청이 완료되었습니다.");
    },
    onError: (error) => {
      console.error("학원 가입 요청 실패:", error);
      toast.error("학원 가입 요청에 실패했습니다.");
    },
  });
}
