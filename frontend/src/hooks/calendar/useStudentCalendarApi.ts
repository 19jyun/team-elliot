import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getMyClasses } from "@/api/student";

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
      const response = await getMyClasses();

      // API 응답 구조 확인
      const data = response.data;

      // MyClassesResponse에서 세션 데이터 추출
      const allSessions = [
        ...(data?.enrollmentClasses || []),
        ...(data?.sessionClasses || []),
      ];
      setSessions(allSessions);
    } catch (err: any) {
      setError(err.response?.data?.message || "세션 로드 실패");
    } finally {
      setIsLoading(false);
    }
  }, [isStudent]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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

  // 캘린더용 세션 데이터 변환 (ConnectedCalendar에서 사용하는 형식으로 맞춤)
  const calendarSessions = sessions.map((session) => {
    return {
      id: session.id,
      classId: session.classId || session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentStudents || 0,
      maxStudents: session.maxStudents || 0,
      isEnrollable: false, // student-view에서는 선택 불가
      isFull: session.currentStudents >= session.maxStudents,
      isPastStartTime:
        new Date(session.date + " " + session.startTime) < new Date(),
      isAlreadyEnrolled: true, // 이미 수강 중인 세션
      studentEnrollmentStatus: "CONFIRMED",
      class: {
        id: session.class?.id || session.classId || session.id,
        className: session.class?.className || "클래스",
        level: session.class?.level || "BEGINNER",
        tuitionFee: session.class?.tuitionFee?.toString() || "50000",
        teacher: {
          id: session.class?.teacher?.id || 0,
          name: session.class?.teacher?.name || "선생님",
        },
      },
    };
  });

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
