import { useCallback } from "react";
import { getTeacherClassesWithSessions } from "@/api/teacher";
import { useTeacherCalendarData } from "@/hooks/redux/useTeacherCalendarData";
import { useAppDispatch } from "@/store/hooks";
import { setLoading, setError } from "@/store/slices/teacherSlice";
import type { TeacherSession } from "@/types/api/teacher";
import type { Session } from "@/lib/auth/AuthProvider";

// Teacher Calendar API 훅 - Redux 기반으로 수정
export function useTeacherCalendarApi(session: Session | null) {
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
  } = useTeacherCalendarData();

  // Teacher가 아닌 경우 데이터 로드하지 않음
  const isTeacher = session?.user?.role === "TEACHER";

  const loadSessions = useCallback(async () => {
    if (!isTeacher) return;

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await getTeacherClassesWithSessions();
      // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
      const data = response.data;
      if (data) {
        setSessions((data.sessions || []) as TeacherSession[]);
      }
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
  }, [dispatch, setSessions]);

  // 캘린더용 세션 데이터 (이미 TeacherSession 타입이므로 그대로 사용)
  const sessions = calendarSessions;

  return {
    // 데이터
    sessions,
    calendarSessions,
    calendarRange,
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
