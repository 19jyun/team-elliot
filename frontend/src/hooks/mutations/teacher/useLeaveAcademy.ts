import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { leaveAcademy } from "@/api/teacher";
import { toast } from "sonner";

/**
 * Teacher 학원 탈퇴 Mutation
 */
export function useLeaveAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await leaveAcademy();
      return response.data;
    },
    onSuccess: () => {
      // 학원 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.teacher.academy.all,
      });
      toast.success("학원에서 탈퇴되었습니다.");
    },
    onError: (error) => {
      console.error("학원 탈퇴 실패:", error);
      toast.error("학원 탈퇴에 실패했습니다.");
    },
  });
}
