import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { getClassDetails } from '@/api/class';
import type { ClassDetailsResponse } from '@/types/api/class';

/**
 * 클래스 상세 정보 조회 (공통)
 */
export function useClassDetails(classId: number) {
  return useQuery({
    queryKey: queryKeys.common.classes.detail(classId),
    queryFn: async (): Promise<ClassDetailsResponse | null> => {
      const response = await getClassDetails(classId);
      return response.data || null;
    },
    enabled: !!classId,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

