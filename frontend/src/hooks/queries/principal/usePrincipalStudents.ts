import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { getPrincipalAllStudents } from '@/api/principal';
import type { PrincipalStudent } from '@/types/api/principal';

/**
 * Principal 학생 목록 조회
 */
export function usePrincipalStudents(filters?: { status?: string }) {
  return useQuery({
    queryKey: queryKeys.principal.students.list(filters),
    queryFn: async (): Promise<PrincipalStudent[]> => {
      const response = await getPrincipalAllStudents();
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

