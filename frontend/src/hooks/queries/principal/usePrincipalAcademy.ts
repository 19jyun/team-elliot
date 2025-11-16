import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { stableQueryOptions } from "@/lib/react-query/queryOptions";
import { getPrincipalAcademy } from "@/api/principal";
import type { PrincipalAcademy } from "@/types/api/principal";

/**
 * Principal 학원 정보 조회
 */
export function usePrincipalAcademy() {
  return useQuery({
    queryKey: queryKeys.principal.academy.detail(),
    queryFn: async (): Promise<PrincipalAcademy | null> => {
      const response = await getPrincipalAcademy();
      return response.data || null;
    },
    ...stableQueryOptions,
    staleTime: 5 * 60 * 1000, // 5분 (학원 정보는 자주 변경되지 않음)
  });
}
