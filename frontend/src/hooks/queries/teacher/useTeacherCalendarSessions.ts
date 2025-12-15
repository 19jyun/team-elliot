import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { calendarQueryOptions } from "@/lib/react-query/queryOptions";
import { getTeacherClassesWithSessions } from "@/api/teacher";
import type { DateRange } from "@/lib/react-query/queryKeys";
import type { TeacherSession } from "@/types/api/teacher";

/**
 * Teacher 캘린더 세션 목록 조회
 */
export function useTeacherCalendarSessions(
  range?: DateRange,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.teacher.calendarSessions.list(range),
    queryFn: async (): Promise<TeacherSession[]> => {
      const response = await getTeacherClassesWithSessions();
      const data = response.data;
      return data?.sessions || [];
    },
    enabled,
    ...calendarQueryOptions,
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * Teacher 개별 캘린더 세션 조회
 */
export function useTeacherCalendarSession(id: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.teacher.calendarSessions.detail(id),
    queryFn: async (): Promise<TeacherSession | null> => {
      // 모든 캘린더 세션 캐시에서 찾기 (range 파라미터 무관하게)
      const allQueries = queryClient.getQueriesData<TeacherSession[]>({
        queryKey: queryKeys.teacher.calendarSessions.lists(),
      });

      // 모든 캐시된 세션 목록에서 찾기
      for (const [, sessions] of allQueries) {
        if (sessions) {
          const session = sessions.find((s) => s.id === id);
          if (session) return session;
        }
      }

      return null;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
