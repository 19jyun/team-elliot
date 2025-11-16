import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { calendarQueryOptions } from '@/lib/react-query/queryOptions';
import { getPrincipalAllSessions } from '@/api/principal';
import type { DateRange } from '@/lib/react-query/queryKeys';
import type { PrincipalClassSession } from '@/types/api/principal';

/**
 * Principal 캘린더 세션 목록 조회
 */
export function usePrincipalCalendarSessions(range?: DateRange) {
  return useQuery({
    queryKey: queryKeys.principal.calendarSessions.list(range),
    queryFn: async (): Promise<PrincipalClassSession[]> => {
      const response = await getPrincipalAllSessions();
      return response.data || [];
    },
    ...calendarQueryOptions,
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * Principal 개별 캘린더 세션 조회
 */
export function usePrincipalCalendarSession(id: number) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.principal.calendarSessions.detail(id),
    queryFn: async (): Promise<PrincipalClassSession | null> => {
      // 먼저 목록 캐시에서 찾기
      const sessions = queryClient.getQueryData<PrincipalClassSession[]>(
        queryKeys.principal.calendarSessions.lists()
      );
      
      if (sessions) {
        const session = sessions.find(s => s.id === id);
        if (session) return session;
      }
      
      return null;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

