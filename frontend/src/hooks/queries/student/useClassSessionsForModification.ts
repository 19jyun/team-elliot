import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getClassSessionsForModification } from "@/api/student";
import type { GetClassSessionsForModificationResponse } from "@/types/api/class";

/**
 * Student 수강 변경용 세션 목록 조회
 */
export function useClassSessionsForModification(classId: number) {
  return useQuery({
    queryKey: queryKeys.student.modificationSessions.list(classId),
    queryFn:
      async (): Promise<GetClassSessionsForModificationResponse | null> => {
        const response = await getClassSessionsForModification(classId);
        return response.data || null;
      },
    enabled: !!classId,
    staleTime: 30 * 1000, // 30초
  });
}
