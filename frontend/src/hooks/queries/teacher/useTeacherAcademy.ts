import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { stableQueryOptions } from "@/lib/react-query/queryOptions";
import { getMyAcademy } from "@/api/teacher";
import type { Academy } from "@/types/api/common";

/**
 * Teacher 학원 정보 조회
 */
export function useTeacherAcademy() {
  return useQuery({
    queryKey: queryKeys.teacher.academy.detail(),
    queryFn: async (): Promise<Academy | null> => {
      const response = await getMyAcademy();
      return response.data || null;
    },
    ...stableQueryOptions,
    staleTime: 5 * 60 * 1000, // 5분 (학원 정보는 자주 변경되지 않음)
  });
}
