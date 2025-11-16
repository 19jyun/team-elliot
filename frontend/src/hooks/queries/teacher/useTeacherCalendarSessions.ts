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
      // 먼저 목록 캐시에서 찾기
      const sessions = queryClient.getQueryData<TeacherSession[]>(
        queryKeys.teacher.calendarSessions.lists()
      );

      if (sessions) {
        const session = sessions.find((s) => s.id === id);
        if (session) return session;
      }

      return null;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
