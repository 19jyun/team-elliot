import { useAppSelector } from "@/store/hooks";
import { useMemo, useCallback } from "react";
import type { TeacherData } from "@/types/store/teacher";

// Teacher 대시보드에서 사용할 데이터 훅
export function useTeacherData() {
  const {
    data: teacherData,
    isLoading,
    error,
  } = useAppSelector((state) => state.teacher);

  // 캘린더용 세션 데이터 변환
  const calendarSessions = useMemo(() => {
    if (!teacherData?.sessions) return [];

    return teacherData.sessions.map((session) => ({
      id: session.id,
      classId: session.classId,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentStudents,
      maxStudents: session.maxStudents,
      isEnrollable: false, // teacher-view에서는 선택 불가
      isFull: session.currentStudents >= session.maxStudents,
      isPastStartTime:
        new Date(session.date + " " + session.startTime) < new Date(),
      class: session.class,
    }));
  }, [teacherData?.sessions]);

  // 특정 클래스의 세션들
  const getClassSessions = useCallback(
    (classId: number) => {
      const cls = teacherData?.classes?.find((c) => c.id === classId);
      return cls?.classSessions || [];
    },
    [teacherData?.classes]
  );

  // 특정 세션의 수강생 목록
  const getSessionEnrollments = useCallback(
    (sessionId: number) => {
      for (const cls of teacherData?.classes || []) {
        const session = cls.classSessions.find((s) => s.id === sessionId);
        if (session) {
          return session.enrollments;
        }
      }
      return [];
    },
    [teacherData?.classes]
  );

  // 특정 세션의 수업 내용
  const getSessionContents = useCallback(
    (sessionId: number) => {
      for (const cls of teacherData?.classes || []) {
        const session = cls.classSessions.find((s) => s.id === sessionId);
        if (session) {
          return session.contents;
        }
      }
      return [];
    },
    [teacherData?.classes]
  );

  // 특정 세션의 발레 포즈
  const getSessionBalletPoses = useCallback(
    (sessionId: number) => {
      const contents = getSessionContents(sessionId);
      return contents.map((content) => content.pose);
    },
    [getSessionContents]
  );

  // 특정 날짜의 세션들 (DateSessionModal용)
  const getSessionsByDate = useCallback(
    (date: Date) => {
      if (!teacherData?.sessions) {
        console.log("❌ Teacher getSessionsByDate - sessions 없음");
        return [];
      }

      const targetDate = date.toISOString().split("T")[0];
      console.log("🔍 Teacher getSessionsByDate - targetDate:", targetDate);
      console.log(
        "🔍 Teacher getSessionsByDate - all sessions:",
        teacherData.sessions
      );

      const filteredSessions = teacherData.sessions.filter((session) => {
        // session.date가 ISO 문자열인 경우 YYYY-MM-DD 형식으로 변환
        const sessionDate = session.date.includes("T")
          ? session.date.split("T")[0]
          : session.date;

        console.log(
          "🔍 Teacher getSessionsByDate - session.date:",
          session.date,
          "sessionDate (normalized):",
          sessionDate,
          "targetDate:",
          targetDate,
          "match:",
          sessionDate === targetDate
        );
        return sessionDate === targetDate;
      });

      console.log(
        "✅ Teacher getSessionsByDate - filtered sessions:",
        filteredSessions
      );
      return filteredSessions;
    },
    [teacherData?.sessions]
  );

  // 세션 ID로 세션 찾기 (SessionDetailModal용)
  const getSessionById = useCallback(
    (sessionId: number) => {
      if (!teacherData?.sessions) return null;
      return (
        teacherData.sessions.find((session) => session.id === sessionId) || null
      );
    },
    [teacherData?.sessions]
  );

  // 선생님 ID로 선생님 찾기
  const getTeacherById = useCallback(
    (teacherId: number) => {
      return teacherData?.userProfile || null;
    },
    [teacherData?.userProfile]
  );

  // 모든 수강신청 (Teacher가 담당하는 세션의 모든 enrollment)
  const enrollments = useMemo(() => {
    const allEnrollments: any[] = [];
    teacherData?.classes?.forEach((cls) => {
      cls.classSessions.forEach((session) => {
        session.enrollments.forEach((enrollment) => {
          allEnrollments.push({
            ...enrollment,
            session,
            class: cls,
          });
        });
      });
    });
    return allEnrollments;
  }, [teacherData?.classes]);

  // 대기 중인 수강신청
  const pendingEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => enrollment.status === "PENDING");
  }, [enrollments]);

  // 대기 중인 환불 요청
  const pendingRefundRequests = useMemo(() => {
    const allRefundRequests: any[] = [];
    teacherData?.classes?.forEach((cls) => {
      cls.classSessions.forEach((session) => {
        session.enrollments.forEach((enrollment) => {
          enrollment.refundRequests?.forEach((refund) => {
            if (refund.status === "PENDING") {
              allRefundRequests.push({
                ...refund,
                enrollment,
                session,
                class: cls,
              });
            }
          });
        });
      });
    });
    return allRefundRequests;
  }, [teacherData?.classes]);

  return {
    // 기본 데이터
    userProfile: teacherData?.userProfile,
    academy: teacherData?.academy,
    principal: teacherData?.principal,
    classes: teacherData?.classes,
    sessions: teacherData?.sessions,
    isLoading,
    error,

    // 파생 데이터
    calendarSessions,
    enrollments,
    pendingEnrollments,
    pendingRefundRequests,

    // 헬퍼 함수들
    getClassSessions,
    getSessionEnrollments,
    getSessionContents,
    getSessionBalletPoses,
    getSessionsByDate,
    getSessionById,
    getTeacherById,
  };
}
