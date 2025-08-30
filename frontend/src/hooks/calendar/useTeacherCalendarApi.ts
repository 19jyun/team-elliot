import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getTeacherClassesWithSessions } from "@/api/teacher";

// Teacher Calendar API 훅
export function useTeacherCalendarApi() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teacher가 아닌 경우 데이터 로드하지 않음
  const isTeacher =
    status === "authenticated" && session?.user?.role === "TEACHER";

  const loadSessions = useCallback(async () => {
    if (!isTeacher) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getTeacherClassesWithSessions();
      // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
      const data = response.data;
      if (data) {
        setSessions(data.sessions || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "세션 로드 실패");
    } finally {
      setIsLoading(false);
    }
  }, [isTeacher]);

  const getSessionsByDate = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const getSessionsByMonth = (year: number, month: number) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getFullYear() === year && sessionDate.getMonth() === month
      );
    });
  };

  const getSessionsByClassId = (classId: number) => {
    return sessions.filter((session) => session.classId === classId);
  };

  const getSessionById = (sessionId: number) => {
    return sessions.find((session) => session.id === sessionId);
  };

  // 캘린더용 세션 데이터 변환
  const calendarSessions = sessions.map((session) => ({
    id: session.id,
    title: session.title || session.class?.name || "세션",
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    classId: session.classId,
    class: session.class,
    enrollments: session.enrollments || [],
    status: session.status,
  }));

  return {
    // 데이터
    sessions,
    calendarSessions,
    isLoading,
    error,
    isTeacher,

    // 로드 함수
    loadSessions,

    // 헬퍼 함수들
    getSessionsByDate,
    getSessionsByMonth,
    getSessionsByClassId,
    getSessionById,
  };
}
