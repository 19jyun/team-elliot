import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { realtimeQueryOptions } from '@/lib/react-query/queryOptions';
import { getPrincipalFilteredEnrollments } from '@/api/principal';
import type { EnrollmentFilters } from '@/lib/react-query/queryKeys';
import type { GetSessionEnrollmentsResponse } from '@/types/api/class-session';

/**
 * Principal 수강신청 목록 조회 (필터링된 버전)
 */
export function usePrincipalEnrollments(filters?: EnrollmentFilters) {
  return useQuery({
    queryKey: queryKeys.principal.enrollments.list(filters),
    queryFn: async (): Promise<GetSessionEnrollmentsResponse[]> => {
      const response = await getPrincipalFilteredEnrollments();
      return response.data || [];
    },
    ...realtimeQueryOptions,
    staleTime: 30 * 1000, // 30초 (실시간 업데이트 필요)
  });
}

/**
 * Principal 개별 수강신청 조회
 */
export function usePrincipalEnrollment(id: number) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.principal.enrollments.detail(id),
    queryFn: async () => {
      // 먼저 목록 캐시에서 찾기
      const enrollments = queryClient.getQueryData<GetSessionEnrollmentsResponse[]>(
        queryKeys.principal.enrollments.lists()
      );
      
      if (enrollments) {
        const enrollment = enrollments.find(e => e.id === id);
        if (enrollment) return enrollment;
      }
      
      // 캐시에 없으면 null 반환 (필요시 개별 API 호출 추가 가능)
      return null;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

