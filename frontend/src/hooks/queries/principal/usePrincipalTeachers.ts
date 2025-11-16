import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { getPrincipalAllTeachers } from '@/api/principal';
import type { PrincipalTeacher } from '@/types/api/principal';

/**
 * Principal 선생님 목록 조회
 */
export function usePrincipalTeachers(filters?: { status?: string }) {
  return useQuery({
    queryKey: queryKeys.principal.teachers.list(filters),
    queryFn: async (): Promise<PrincipalTeacher[]> => {
      const response = await getPrincipalAllTeachers();
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

