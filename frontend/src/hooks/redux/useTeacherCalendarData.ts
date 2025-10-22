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
} from "@/store/slices/teacherSlice";
import type { TeacherSession } from "@/types/api/teacher";

// Teacher 캘린더 데이터 훅 - Redux store에서 데이터 가져오기
export function useTeacherCalendarData() {
  const dispatch = useAppDispatch();

  // Redux store에서 teacher 데이터 가져오기
  const teacherData = useSelector((state: RootState) => state.teacher.data);
  const isLoading = useSelector((state: RootState) => state.teacher.isLoading);
  const error = useSelector((state: RootState) => state.teacher.error);

  // 캘린더 세션 데이터
  const calendarSessions = useMemo((): TeacherSession[] => {
    return teacherData?.calendarSessions || [];
  }, [teacherData?.calendarSessions]);

  // 캘린더 범위
  const calendarRange = useMemo(() => {
    return teacherData?.calendarRange || null;
  }, [teacherData?.calendarRange]);

  // 캘린더 세션 데이터 설정
  const setSessions = useCallback(
    (sessions: TeacherSession[]) => {
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
    (session: TeacherSession) => {
      dispatch(addCalendarSession(session));
    },
    [dispatch]
  );

  // 개별 세션 업데이트
  const updateSession = useCallback(
    (session: TeacherSession) => {
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
    (date: Date): TeacherSession[] => {
      return calendarSessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString();
      });
    },
    [calendarSessions]
  );

  const getSessionsByMonth = useCallback(
    (year: number, month: number): TeacherSession[] => {
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
    (classId: number): TeacherSession[] => {
      return calendarSessions.filter((session) => session.class.id === classId);
    },
    [calendarSessions]
  );

  const getSessionById = useCallback(
    (sessionId: number): TeacherSession | undefined => {
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
