import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { stableQueryOptions } from "@/lib/react-query/queryOptions";
import { getPrincipalStudentSessionHistory } from "@/api/principal";

/**
 * Principal 학생 세션 수강 현황 조회
 * 백엔드 응답: SessionEnrollment[] (Prisma 모델)
 * 구조: { id, status, enrolledAt, session: { date, startTime, endTime, class: { id, className, teacher } } }
 */
export function usePrincipalStudentSessionHistory(
  studentId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.principal.students.sessionHistory(studentId),
    queryFn: async () => {
      const response = await getPrincipalStudentSessionHistory(studentId);
      // 백엔드에서 SessionEnrollment[] 배열을 직접 반환
      return response.data || [];
    },
    enabled: !!studentId && enabled,
    ...stableQueryOptions,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
