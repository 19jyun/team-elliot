import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import type { RootState } from "@/store/index";
import {
  setCalendarSessions,
  setCalendarRange,
  addCalendarSession,
  updateCalendarSession,
  removeCalendarSession,
} from "@/store/slices/principalSlice";
import type { PrincipalClassSession } from "@/types/api/principal";

// Principal 캘린더 데이터 훅 - Redux store에서 데이터 가져오기
export function usePrincipalCalendarData() {
  const dispatch = useAppDispatch();

  // Redux store에서 principal 데이터 가져오기
  const principalData = useSelector((state: RootState) => state.principal.data);
  const isLoading = useSelector(
    (state: RootState) => state.principal.isLoading
  );
  const error = useSelector((state: RootState) => state.principal.error);

  // 캘린더 세션 데이터
  const calendarSessions = useMemo((): PrincipalClassSession[] => {
    return principalData?.calendarSessions || [];
  }, [principalData?.calendarSessions]);

  // 캘린더 범위
  const calendarRange = useMemo(() => {
    return principalData?.calendarRange || null;
  }, [principalData?.calendarRange]);

  // 캘린더 세션 데이터 설정
  const setSessions = useCallback(
    (sessions: PrincipalClassSession[]) => {
      dispatch(setCalendarSessions(sessions));
    },
    [dispatch]
  );

  // 캘린더 범위 설정
  const setRange = useCallback(
    (range: { startDate: string; endDate: string } | null) => {
      dispatch(setCalendarRange(range));
    },
    [dispatch]
  );

  // 개별 세션 추가
  const addSession = useCallback(
    (session: PrincipalClassSession) => {
      dispatch(addCalendarSession(session));
    },
    [dispatch]
  );

  // 개별 세션 업데이트
  const updateSession = useCallback(
    (session: PrincipalClassSession) => {
      dispatch(updateCalendarSession(session));
    },
    [dispatch]
  );

  // 개별 세션 제거
  const removeSession = useCallback(
    (sessionId: number) => {
      dispatch(removeCalendarSession(sessionId));
    },
    [dispatch]
  );

  // 헬퍼 함수들
  const getSessionsByDate = useCallback(
    (date: Date): PrincipalClassSession[] => {
      return calendarSessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString();
      });
    },
    [calendarSessions]
  );

  const getSessionsByMonth = useCallback(
    (year: number, month: number): PrincipalClassSession[] => {
      return calendarSessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return (
          sessionDate.getFullYear() === year && sessionDate.getMonth() === month
        );
      });
    },
    [calendarSessions]
  );

  const getSessionsByClassId = useCallback(
    (classId: number): PrincipalClassSession[] => {
      return calendarSessions.filter((session) => session.classId === classId);
    },
    [calendarSessions]
  );

  const getSessionById = useCallback(
    (sessionId: number): PrincipalClassSession | undefined => {
      return calendarSessions.find((session) => session.id === sessionId);
    },
    [calendarSessions]
  );

  return {
    // 데이터
    calendarSessions,
    calendarRange,
    isLoading,
    error,

    // 액션 함수들
    setSessions,
    setRange,
    addSession,
    updateSession,
    removeSession,

    // 헬퍼 함수들
    getSessionsByDate,
    getSessionsByMonth,
    getSessionsByClassId,
    getSessionById,
  };
}
