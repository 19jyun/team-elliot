import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getMyClasses } from "@/api/student";
import type { MyClassesResponse } from "@/types/api/student";

// Student Calendar API 훅
export function useStudentCalendarApi() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student가 아닌 경우 데이터 로드하지 않음
  const isStudent =
    status === "authenticated" && session?.user?.role === "STUDENT";

  const loadSessions = useCallback(async () => {
    if (!isStudent) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyClasses();
      // MyClassesResponse에서 세션 데이터 추출
      const allSessions = [
        ...(data.enrollmentClasses || []),
        ...(data.sessionClasses || []),
      ];
      setSessions(allSessions);
    } catch (err: any) {
      setError(err.response?.data?.message || "세션 로드 실패");
    } finally {
      setIsLoading(false);
    }
  }, [isStudent]);

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
    isStudent,

    // 로드 함수
    loadSessions,

    // 헬퍼 함수들
    getSessionsByDate,
    getSessionsByMonth,
    getSessionsByClassId,
    getSessionById,
  };
}
