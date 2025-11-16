import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { realtimeQueryOptions } from '@/lib/react-query/queryOptions';
import { getPrincipalFilteredRefundRequests } from '@/api/principal';
import type { RefundFilters } from '@/lib/react-query/queryKeys';
import type { RefundRequestListResponse } from '@/types/api/refund';

/**
 * Principal 환불 요청 목록 조회 (필터링된 버전)
 */
export function usePrincipalRefundRequests(filters?: RefundFilters) {
  return useQuery({
    queryKey: queryKeys.principal.refundRequests.list(filters),
    queryFn: async (): Promise<RefundRequestListResponse> => {
      const response = await getPrincipalFilteredRefundRequests();
      // API returns array, convert to expected object structure
      const refundRequests = response.data || [];
      return { refundRequests, total: refundRequests.length, page: 1, limit: refundRequests.length };
    },
    ...realtimeQueryOptions,
    staleTime: 30 * 1000, // 30초 (실시간 업데이트 필요)
  });
}

/**
 * Principal 개별 환불 요청 조회
 */
export function usePrincipalRefundRequest(id: number) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.principal.refundRequests.detail(id),
    queryFn: async () => {
      // 먼저 목록 캐시에서 찾기
      const refundRequestsData = queryClient.getQueryData<RefundRequestListResponse>(
        queryKeys.principal.refundRequests.lists()
      );
      
      if (refundRequestsData?.refundRequests) {
        const refundRequest = refundRequestsData.refundRequests.find(r => r.id === id);
        if (refundRequest) return refundRequest;
      }
      
      // 캐시에 없으면 null 반환 (필요시 개별 API 호출 추가 가능)
      return null;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

