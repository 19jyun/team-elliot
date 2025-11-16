import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { getMyAcademies } from '@/api/student';
import type { GetMyAcademiesResponse } from '@/types/api/student';

/**
 * Student 학원 목록 조회
 */
export function useStudentAcademies() {
  return useQuery({
    queryKey: queryKeys.student.academies.lists(),
    queryFn: async (): Promise<GetMyAcademiesResponse> => {
      const response = await getMyAcademies();
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2분
  });
}

