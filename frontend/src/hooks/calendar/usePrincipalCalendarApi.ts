import { useState, useCallback } from "react";
import { useSession } from "@/lib/auth/AuthProvider";
import { getPrincipalAllSessions } from "@/api/principal";
import type { PrincipalClassSession } from "@/types/api/principal";

// Principal Calendar API 훅
export function usePrincipalCalendarApi() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<PrincipalClassSession[]>([]);
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
      const response = await getPrincipalAllSessions();
      setSessions(response.data || []);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "세션 로드 실패";
      setError(errorMessage || "세션 로드 실패");
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

  // 캘린더용 세션 데이터 변환 (이미 PrincipalClassSession 타입이므로 그대로 사용)
  const calendarSessions = sessions;

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
