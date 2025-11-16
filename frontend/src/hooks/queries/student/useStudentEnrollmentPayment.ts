import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getSessionPaymentInfo } from "@/api/student";
import type { GetSessionPaymentInfoResponse } from "@/types/api/student";

/**
 * Student 여러 세션의 결제 정보 조회 (병렬)
 */
export function useStudentEnrollmentPayment(
  sessionIds: number[],
  enabled: boolean = true
) {
  return useQueries({
    queries: sessionIds.map((sessionId) => ({
      queryKey: queryKeys.student.paymentInfo.detail(sessionId),
      queryFn: async (): Promise<GetSessionPaymentInfoResponse | null> => {
        const response = await getSessionPaymentInfo(sessionId);
        return response.data || null;
      },
      enabled: enabled && !!sessionId,
      staleTime: 1 * 60 * 1000, // 1분
    })),
  });
}

/**
 * Student 단일 세션의 결제 정보 조회
 */
export function useStudentEnrollmentPaymentSingle(
  sessionId: number,
  enabled: boolean = true
) {
  return useQueries({
    queries: [
      {
        queryKey: queryKeys.student.paymentInfo.detail(sessionId),
        queryFn: async (): Promise<GetSessionPaymentInfoResponse | null> => {
          const response = await getSessionPaymentInfo(sessionId);
          return response.data || null;
        },
        enabled: enabled && !!sessionId,
        staleTime: 1 * 60 * 1000, // 1분
      },
    ],
  });
}
