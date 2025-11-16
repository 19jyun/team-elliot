import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { stableQueryOptions } from '@/lib/react-query/queryOptions';
import { getTeacherProfile } from '@/api/teacher';
import type { TeacherProfileResponse } from '@/types/api/teacher';

/**
 * Teacher 프로필 정보 조회
 */
export function useTeacherProfile() {
  return useQuery({
    queryKey: queryKeys.teacher.profile.detail(),
    queryFn: async (): Promise<TeacherProfileResponse | null> => {
      const response = await getTeacherProfile();
      return response.data || null;
    },
    ...stableQueryOptions,
    staleTime: 5 * 60 * 1000, // 5분 (프로필은 자주 변경되지 않음)
  });
}

