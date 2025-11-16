import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { getTeacherClassesWithSessions } from '@/api/teacher';
import type { TeacherClass, TeacherSession } from '@/types/api/teacher';

/**
 * Teacher 클래스 및 세션 목록 조회
 */
export function useTeacherClasses() {
  return useQuery({
    queryKey: queryKeys.teacher.classes.lists(),
    queryFn: async (): Promise<{ classes: TeacherClass[]; sessions: TeacherSession[] }> => {
      const response = await getTeacherClassesWithSessions();
      const data = response.data;
      return {
        classes: data?.classes || [],
        sessions: data?.sessions || [],
      };
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * Teacher 개별 클래스 조회
 */
export function useTeacherClass(classId: number) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: queryKeys.teacher.classes.detail(classId),
    queryFn: async (): Promise<TeacherClass | null> => {
      // 먼저 목록 캐시에서 찾기
      const classesData = queryClient.getQueryData<{ classes: TeacherClass[]; sessions: TeacherSession[] }>(
        queryKeys.teacher.classes.lists()
      );
      
      if (classesData?.classes) {
        const classItem = classesData.classes.find(c => c.id === classId);
        if (classItem) return classItem;
      }
      
      return null;
    },
    enabled: !!classId,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

