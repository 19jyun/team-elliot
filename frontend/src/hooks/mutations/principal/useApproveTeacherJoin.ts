import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { approveTeacherJoinRequest } from "@/api/principal";
import { toast } from "sonner";

/**
 * Principal 선생님 가입 신청 승인 Mutation
 */
export function useApproveTeacherJoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: number) => {
      const response = await approveTeacherJoinRequest(requestId);
      return response.data;
    },

    // 성공 시
    onSuccess: () => {
      // 가입 신청 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.teacherJoinRequests.lists(),
      });

      // 선생님 목록도 무효화 (새 선생님 추가됨)
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.teachers.lists(),
      });

      toast.success("선생님 가입 신청이 승인되었습니다.");
    },

    // 에러 시
    onError: () => {
      toast.error("선생님 가입 신청 승인에 실패했습니다.");
    },
  });
}
