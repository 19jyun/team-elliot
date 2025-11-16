import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { calendarQueryOptions } from "@/lib/react-query/queryOptions";
import { getMyClasses } from "@/api/student";
import type { DateRange } from "@/lib/react-query/queryKeys";
import type { ClassSessionForEnrollment } from "@/types/api/student";

/**
 * Student 캘린더 세션 목록 조회
 */
export function useStudentCalendarSessions(
  range?: DateRange,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.student.calendarSessions.list(range),
    queryFn: async (): Promise<ClassSessionForEnrollment[]> => {
      const response = await getMyClasses();
      // sessionClasses는 ClassSession[] 타입이지만, 실제로는 ClassSessionForEnrollment 구조를 포함함
      return (response.data?.sessionClasses ||
        []) as ClassSessionForEnrollment[];
    },
    enabled,
    ...calendarQueryOptions,
    staleTime: 2 * 60 * 1000, // 2분
  });
}
