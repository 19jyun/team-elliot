import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getPrincipalAllSessions } from "@/api/principal";
import { getClassSessionsForEnrollment as getClassSessions } from "@/api/student";
import type { ClassSession } from "@/types/api/class";
import { extractErrorMessage } from "@/types/api/error";
import { toClassSessionForCalendar } from "@/lib/adapters/principal";

// 캘린더용 API 훅
export function useCalendarApi() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Principal인지 확인
  const isPrincipal =
    status === "authenticated" && session?.user?.role === "PRINCIPAL";

  // Principal의 모든 세션 로드
  const loadPrincipalSessions = async () => {
    if (!isPrincipal) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getPrincipalAllSessions();
      setSessions((data.data || []).map(toClassSessionForCalendar));
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "세션 로드 실패"));
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 클래스의 세션 로드
  const loadClassSessions = async (classId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClassSessions(classId);
      setSessions(data.data?.sessions || []);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "클래스 세션 로드 실패"));
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 날짜의 세션들 필터링
  const getSessionsByDate = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  // 특정 월의 세션들 필터링
  const getSessionsByMonth = (year: number, month: number) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getFullYear() === year &&
        sessionDate.getMonth() + 1 === month
      );
    });
  };

  // 특정 클래스의 세션들 필터링
  const getSessionsByClassId = (classId: number) => {
    return sessions.filter((session) => session.classId === classId);
  };

  // 캘린더용 세션 데이터 변환
  const calendarSessions = useMemo(() => {
    return sessions.map((session) => ({
      id: session.id,
      classId: session.classId,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentStudents || 0,
      maxStudents: session.maxStudents || 0,
      isEnrollable: session.isEnrollable || false,
      isFull: session.isFull || false,
      isPastStartTime: session.isPastStartTime || false,
      isAlreadyEnrolled: session.isAlreadyEnrolled || false,
      studentEnrollmentStatus: session.studentEnrollmentStatus || "NONE",
      class: {
        id: session.class?.id || session.classId,
        className: session.class?.className || "클래스",
        level: session.class?.level || "BEGINNER",
        tuitionFee: session.class?.tuitionFee?.toString() || "50000",
        teacher: {
          id: session.class?.teacher?.id || 0,
          name: session.class?.teacher?.name || "선생님",
        },
      },
    }));
  }, [sessions]);

  return {
    // 데이터
    sessions,
    calendarSessions,
    isLoading,
    error,
    isPrincipal,

    // 로드 함수들
    loadPrincipalSessions,
    loadClassSessions,

    // 헬퍼 함수들
    getSessionsByDate,
    getSessionsByMonth,
    getSessionsByClassId,
  };
}
