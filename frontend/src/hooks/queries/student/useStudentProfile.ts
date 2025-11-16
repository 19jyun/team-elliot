import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { stableQueryOptions } from '@/lib/react-query/queryOptions';
import { getMyProfile } from '@/api/student';
import type { StudentProfile } from '@/types/api/student';

/**
 * Student 프로필 정보 조회
 */
export function useStudentProfile() {
  return useQuery({
    queryKey: queryKeys.student.profile.detail(),
    queryFn: async (): Promise<StudentProfile | null> => {
      const response = await getMyProfile();
      return response.data || null;
    },
    ...stableQueryOptions,
    staleTime: 5 * 60 * 1000, // 5분 (프로필은 자주 변경되지 않음)
  });
}

