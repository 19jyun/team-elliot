import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { stableQueryOptions } from "@/lib/react-query/queryOptions";
import { getPrincipalProfile } from "@/api/principal";
import type { PrincipalProfile } from "@/types/api/principal";

/**
 * Principal 프로필 정보 조회
 */
export function usePrincipalProfile() {
  return useQuery({
    queryKey: queryKeys.principal.profile.detail(),
    queryFn: async (): Promise<PrincipalProfile | null> => {
      const response = await getPrincipalProfile();
      return response.data || null;
    },
    ...stableQueryOptions,
    staleTime: 5 * 60 * 1000, // 5분 (프로필은 자주 변경되지 않음)
  });
}
