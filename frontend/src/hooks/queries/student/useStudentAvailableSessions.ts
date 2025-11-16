import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { getStudentAvailableSessionsForEnrollment } from '@/api/student';
import type { AvailableSessionForEnrollment } from '@/types/api/student';

/**
 * Student 수강 가능한 세션 목록 조회
 */
export function useStudentAvailableSessions(academyId: number) {
  return useQuery({
    queryKey: queryKeys.student.availableSessions.list(academyId),
    queryFn: async (): Promise<AvailableSessionForEnrollment[]> => {
      const response = await getStudentAvailableSessionsForEnrollment(academyId);
      return response.data?.sessions || [];
    },
    enabled: !!academyId,
    staleTime: 30 * 1000, // 30초 (수강 가능한 세션은 자주 변경될 수 있음)
  });
}

