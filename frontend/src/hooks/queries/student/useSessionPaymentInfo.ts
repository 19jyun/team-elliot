import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getSessionPaymentInfo } from "@/api/student";
import type { GetSessionPaymentInfoResponse } from "@/types/api/student";

/**
 * Student 세션 결제 정보 조회
 */
export function useSessionPaymentInfo(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.student.paymentInfo.detail(sessionId),
    queryFn: async (): Promise<GetSessionPaymentInfoResponse | null> => {
      const response = await getSessionPaymentInfo(sessionId);
      return response.data || null;
    },
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
