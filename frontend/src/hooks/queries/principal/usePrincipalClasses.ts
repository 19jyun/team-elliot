import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { getPrincipalAllClasses } from '@/api/principal';
import type { PrincipalClass } from '@/types/api/principal';

/**
 * Principal 클래스 목록 조회
 */
export function usePrincipalClasses(filters?: { status?: string }) {
  return useQuery({
    queryKey: queryKeys.principal.classes.list(filters),
    queryFn: async (): Promise<PrincipalClass[]> => {
      const response = await getPrincipalAllClasses();
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

