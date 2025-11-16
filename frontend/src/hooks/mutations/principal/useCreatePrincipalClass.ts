import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { createPrincipalClass } from "@/api/principal";
import { toast } from "sonner";
import type { CreatePrincipalClassRequest } from "@/types/api/principal";

/**
 * Principal 클래스 생성 Mutation
 */
export function useCreatePrincipalClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePrincipalClassRequest) => {
      const response = await createPrincipalClass(data);
      return response.data;
    },

    // 성공 시
    onSuccess: (data) => {
      // 클래스 목록 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.classes.lists(),
      });

      // 새로 생성된 클래스도 캐시에 추가
      if (data) {
        queryClient.setQueryData(
          queryKeys.principal.classes.detail(data.id),
          data
        );
      }

      // 캘린더 세션도 무효화 (새 클래스 생성 시)
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.calendarSessions.lists(),
      });

      toast.success("클래스가 생성되었습니다.");
    },

    // 에러 시
    onError: () => {
      toast.error("클래스 생성에 실패했습니다.");
    },
  });
}
