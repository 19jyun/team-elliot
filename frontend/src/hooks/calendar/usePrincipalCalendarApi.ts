import { useCallback } from "react";
import { useSession } from "@/lib/auth/AuthProvider";
import { getPrincipalAllSessions } from "@/api/principal";
import { usePrincipalCalendarData } from "@/hooks/redux/usePrincipalCalendarData";
import { useAppDispatch } from "@/store/hooks";
import { setLoading, setError } from "@/store/slices/principalSlice";

// Principal Calendar API 훅 - Redux 기반으로 수정
export function usePrincipalCalendarApi() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  // Redux 기반 캘린더 데이터 훅 사용
  const {
    calendarSessions,
    calendarRange,
    isLoading,
    error,
    setSessions,
    getSessionsByDate,
    getSessionsByMonth,
    getSessionsByClassId,
    getSessionById,
  } = usePrincipalCalendarData();

  // Principal이 아닌 경우 데이터 로드하지 않음
  const isPrincipal =
    status === "authenticated" && session?.user?.role === "PRINCIPAL";

  const loadSessions = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await getPrincipalAllSessions();
      setSessions(response.data || []);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "세션 로드 실패";
      dispatch(setError(errorMessage || "세션 로드 실패"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [isPrincipal, dispatch, setSessions]);

  // 캘린더용 세션 데이터 (이미 PrincipalClassSession 타입이므로 그대로 사용)
  const sessions = calendarSessions;

  return {
    // 데이터
    sessions,
    calendarSessions,
    calendarRange,
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
