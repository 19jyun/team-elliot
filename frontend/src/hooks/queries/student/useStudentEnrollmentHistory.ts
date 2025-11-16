import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getEnrollmentHistory } from "@/api/student";
import type { EnrollmentHistory } from "@/types/api/student";

/**
 * Student 수강 내역 조회
 */
export function useStudentEnrollmentHistory() {
  return useQuery({
    queryKey: queryKeys.student.enrollmentHistory.lists(),
    queryFn: async (): Promise<EnrollmentHistory[]> => {
      const response = await getEnrollmentHistory();
      // API는 EnrollmentHistory[] 배열을 직접 반환
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * Student 개별 수강 내역 조회
 */
export function useStudentEnrollmentHistoryDetail(id: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.student.enrollmentHistory.detail(id),
    queryFn: async (): Promise<EnrollmentHistory | null> => {
      // 먼저 목록 캐시에서 찾기
      const enrollments = queryClient.getQueryData<EnrollmentHistory[]>(
        queryKeys.student.enrollmentHistory.lists()
      );

      if (enrollments) {
        const enrollment = enrollments.find((e) => e.id === id);
        if (enrollment) return enrollment;
      }

      return null;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
