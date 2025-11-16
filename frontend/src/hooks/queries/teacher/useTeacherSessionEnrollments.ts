import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getSessionEnrollments } from "@/api/teacher";
import type { SessionEnrollmentsResponse } from "@/types/api/teacher";
import { realtimeQueryOptions } from "@/lib/react-query/queryOptions";

/**
 * Teacher 세션 수강생 목록 조회
 */
export function useTeacherSessionEnrollments(
  sessionId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.teacher.sessionEnrollments.detail(sessionId),
    queryFn: async (): Promise<SessionEnrollmentsResponse | null> => {
      const response = await getSessionEnrollments(sessionId);
      return response.data || null;
    },
    enabled: !!sessionId && enabled,
    ...realtimeQueryOptions,
  });
}
