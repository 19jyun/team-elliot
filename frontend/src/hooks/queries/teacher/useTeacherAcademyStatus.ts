import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { stableQueryOptions } from "@/lib/react-query/queryOptions";
import { getTeacherAcademyStatus } from "@/api/teacher";
import type { TeacherAcademyStatusResponse } from "@/types/api/teacher";

/**
 * Teacher 학원 가입 상태 조회
 */
export function useTeacherAcademyStatus() {
  return useQuery({
    queryKey: queryKeys.teacher.academy.status(),
    queryFn: async (): Promise<TeacherAcademyStatusResponse | null> => {
      const response = await getTeacherAcademyStatus();
      return response.data || null;
    },
    ...stableQueryOptions,
    staleTime: 30 * 1000, // 30초 (가입 상태는 자주 확인할 수 있음)
  });
}
