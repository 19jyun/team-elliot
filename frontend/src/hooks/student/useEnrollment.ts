// frontend/src/hooks/student/useEnrollment.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchEnrollSessions } from "@/api/student";
import { toast } from "sonner";

export const useEnrollment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // 1. API 호출 함수
    mutationFn: async ({ sessionIds }: { sessionIds: number[] }) => {
      return await batchEnrollSessions({ sessionIds });
    },

    // 2. 성공 시 처리 (데이터 갱신)
    onSuccess: () => {
      toast.success("수강신청이 완료되었습니다.");

      // 관련된 모든 쿼리 무효화 -> React Query가 자동으로 최신 데이터를 다시 가져옴
      queryClient.invalidateQueries({
        queryKey: ["student", "enrollment-history"],
      });
      queryClient.invalidateQueries({
        queryKey: ["student", "calendar-sessions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["student", "available-sessions"],
      });
    },

    // 3. 실패 시 처리 (에러 메시지)
    onError: (error: unknown) => {
      // 에러 메시지 추출 로직 (기존 유틸 활용 가능)
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "수강신청에 실패했습니다.";
      toast.error(message);
    },
  });

  return {
    enrollSessions: (sessionIds: number[]) =>
      mutation.mutateAsync({ sessionIds }),

    isLoading: mutation.isPending, // 로딩 상태 반환 (UI에서 스피너 표시에 사용)
  };
};
