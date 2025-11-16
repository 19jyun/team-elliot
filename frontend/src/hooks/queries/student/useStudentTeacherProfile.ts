import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getTeacherProfile } from "@/api/student";
import type { TeacherProfileForStudentResponse } from "@/types/api/student";

/**
 * Student용 Teacher 프로필 조회
 */
export function useStudentTeacherProfile(
  teacherId: number,
  enabled: boolean = true
) {
  return useQuery<TeacherProfileForStudentResponse | null, Error>({
    queryKey: queryKeys.student.teacherProfile.detail(teacherId),
    queryFn: async (): Promise<TeacherProfileForStudentResponse | null> => {
      const response = await getTeacherProfile(teacherId);
      return response.data || null;
    },
    enabled: !!teacherId && enabled,
    staleTime: 5 * 60 * 1000, // 5분 (프로필은 자주 변경되지 않음)
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
