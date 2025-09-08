import { useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/index";
import type { ClassSession as Session } from "@/types/api/class";

// Student Calendar API 훅 - Redux store에서 데이터 가져오기
export function useStudentCalendarApi() {
  const { data: session, status } = useSession();

  // Redux store에서 student 데이터 가져오기
  const studentData = useSelector((state: RootState) => state.student.data);
  const isLoading = useSelector((state: RootState) => state.student.isLoading);
  const error = useSelector((state: RootState) => state.student.error);

  // Student가 아닌 경우 빈 배열 반환
  const isStudent =
    status === "authenticated" && session?.user?.role === "STUDENT";

  // Redux에서 가져온 calendarSessions (Session[] 타입)
  const sessions = useMemo((): Session[] => {
    if (!isStudent || !studentData) return [];
    return studentData.calendarSessions || [];
  }, [isStudent, studentData]);

  // loadSessions는 Redux에서 이미 데이터가 로드되므로 빈 함수
  const loadSessions = useCallback(() => {
    // Redux store에서 이미 데이터가 로드되어 있음
    // useStudentInitialization에서 getMyClasses() 호출하여 데이터 로드
  }, []);

  const getSessionsByDate = (date: Date): Session[] => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const getSessionsByMonth = (year: number, month: number): Session[] => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getFullYear() === year && sessionDate.getMonth() === month
      );
    });
  };

  const getSessionsByClassId = (classId: number): Session[] => {
    return sessions.filter((session) => session.classId === classId);
  };

  const getSessionById = (sessionId: number): Session | undefined => {
    return sessions.find((session) => session.id === sessionId);
  };

  // 캘린더용 세션 데이터 (Session 타입이 이미 ClassSession과 호환됨)
  const calendarSessions = useMemo((): Session[] => {
    return sessions; // Session 타입이 이미 ClassSession과 동일한 구조
  }, [sessions]);

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
