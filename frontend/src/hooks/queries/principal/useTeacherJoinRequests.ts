import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { realtimeQueryOptions } from '@/lib/react-query/queryOptions';
import { getTeacherJoinRequests } from '@/api/principal';
import type { TeacherJoinRequestsResponse } from '@/types/api/principal';

/**
 * Principal 선생님 가입 신청 목록 조회
 */
export function useTeacherJoinRequests() {
  return useQuery({
    queryKey: queryKeys.principal.teacherJoinRequests.lists(),
    queryFn: async (): Promise<TeacherJoinRequestsResponse | null> => {
      const response = await getTeacherJoinRequests();
      return response.data || null;
    },
    ...realtimeQueryOptions,
    staleTime: 30 * 1000, // 30초 (실시간 업데이트 필요)
  });
}

