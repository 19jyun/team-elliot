import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { joinAcademy } from "@/api/student";
import { toast } from "sonner";
import type { StudentJoinAcademyRequest } from "@/types/api/student";

/**
 * Student 학원 가입 Mutation
 */
export function useJoinAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentJoinAcademyRequest) => {
      const response = await joinAcademy(data);
      return response.data;
    },

    // 성공 시
    onSuccess: () => {
      // 학원 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.academies.lists(),
      });

      toast.success("학원 가입이 완료되었습니다.");
    },

    // 에러 시
    onError: () => {
      toast.error("학원 가입에 실패했습니다.");
    },
  });
}
