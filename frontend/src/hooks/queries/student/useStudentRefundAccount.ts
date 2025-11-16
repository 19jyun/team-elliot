import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { stableQueryOptions } from '@/lib/react-query/queryOptions';
import { getRefundAccount } from '@/api/student';
import type { StudentRefundAccount } from '@/types/api/student';

/**
 * Student 환불 계좌 정보 조회
 */
export function useStudentRefundAccount() {
  return useQuery({
    queryKey: queryKeys.student.refundAccount.detail(),
    queryFn: async (): Promise<StudentRefundAccount | null> => {
      const response = await getRefundAccount();
      return response.data || null;
    },
    ...stableQueryOptions,
    staleTime: 5 * 60 * 1000, // 5분 (환불 계좌는 자주 변경되지 않음)
  });
}

