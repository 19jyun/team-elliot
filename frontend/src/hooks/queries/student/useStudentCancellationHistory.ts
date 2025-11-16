import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getCancellationHistory } from "@/api/student";
import type { CancellationHistory } from "@/types/api/student";

/**
 * Student 환불/취소 내역 조회
 */
export function useStudentCancellationHistory() {
  return useQuery({
    queryKey: queryKeys.student.cancellationHistory.lists(),
    queryFn: async (): Promise<CancellationHistory[]> => {
      const response = await getCancellationHistory();
      // API는 CancellationHistory[] 배열을 직접 반환
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * Student 개별 환불/취소 내역 조회
 */
export function useStudentCancellationHistoryDetail(id: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.student.cancellationHistory.detail(id),
    queryFn: async (): Promise<CancellationHistory | null> => {
      // 먼저 목록 캐시에서 찾기
      const cancellations = queryClient.getQueryData<CancellationHistory[]>(
        queryKeys.student.cancellationHistory.lists()
      );

      if (cancellations) {
        const cancellation = cancellations.find((c) => c.id === id);
        if (cancellation) return cancellation;
      }

      return null;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
