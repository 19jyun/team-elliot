import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getPrincipalAllSessions } from "@/api/principal";
import type { Session } from "@/types/store/principal";

// Principal Calendar API 훅
export function usePrincipalCalendarApi() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Principal이 아닌 경우 데이터 로드하지 않음
  const isPrincipal =
    status === "authenticated" && session?.user?.role === "PRINCIPAL";

  const loadSessions = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getPrincipalAllSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "세션 로드 실패");
    } finally {
      setIsLoading(false);
    }
  }, [isPrincipal]);

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
  const calendarSessions = sessions.map((session: any) => ({
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
    isPrincipal,

    // 로드 함수
    loadSessions,

    // 헬퍼 함수들
    getSessionsByDate,
    getSessionsByMonth,
    getSessionsByClassId,
    getSessionById,
  };
}
