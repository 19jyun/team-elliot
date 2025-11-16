import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getPrincipalSessionEnrollments } from "@/api/principal";
import type { SessionEnrollmentsResponse } from "@/types/api/teacher";

/**
 * Principal 세션 수강생 목록 조회
 */
export function usePrincipalSessionEnrollments(
  sessionId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.principal.sessionEnrollments.detail(sessionId),
    queryFn: async (): Promise<SessionEnrollmentsResponse | null> => {
      const response = await getPrincipalSessionEnrollments(sessionId);
      return response.data || null;
    },
    enabled: !!sessionId && enabled,
    staleTime: 30 * 1000, // 30초
  });
}
