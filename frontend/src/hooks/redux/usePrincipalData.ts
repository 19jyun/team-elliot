import { useAppSelector } from "@/store/hooks";
import { useMemo, useCallback } from "react";

// Principal 대시보드에서 사용할 데이터 훅
export function usePrincipalData() {
  const { user, principalData, isLoading, error } = useAppSelector(
    (state) => state.appData
  );

  // 클래스를 세션 형태로 변환
  const sessions = useMemo(() => {
    if (!principalData?.classes || principalData.classes.length === 0) {
      console.log("No classes found in Redux store");
      return [];
    }

    // 모든 클래스의 classSessions를 추출하여 하나의 배열로 합치기
    const allSessions = principalData.classes.flatMap((cls: any) => {
      if (!cls.classSessions || cls.classSessions.length === 0) {
        return [];
      }

      return cls.classSessions.map((session: any) => ({
        id: session.id,
        classId: session.classId,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        currentStudents: session.currentStudents || 0,
        maxStudents: session.maxStudents || 0,
        class: {
          id: cls.id,
          className: cls.className,
          level: cls.level,
          tuitionFee: cls.tuitionFee?.toString() || "50000",
          teacher: {
            id: cls.teacherId || 0,
            name: cls.teacher?.name || "선생님",
          },
        },
      }));
    });

    console.log("usePrincipalData - classes:", principalData.classes);
    console.log("usePrincipalData - allSessions:", allSessions);
    return allSessions;
  }, [principalData?.classes]);

  // 캘린더용 세션 데이터 변환 (ConnectedCalendar에서 사용)
  const calendarSessions = useMemo(() => {
    if (!sessions) return [];

    const result = sessions.map((session: any) => ({
      id: session.id,
      classId: session.classId || session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentStudents || 0,
      maxStudents: session.maxStudents || 0,
      isEnrollable: false, // principal-view에서는 선택 불가
      isFull: session.currentStudents >= session.maxStudents,
      isPastStartTime:
        new Date(session.date + " " + session.startTime) < new Date(),
      isAlreadyEnrolled: false, // principal-view에서는 해당 없음
      studentEnrollmentStatus: "CONFIRMED", // principal-view에서는 해당 없음
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
    }));

    console.log("usePrincipalData - calendarSessions:", result);
    return result;
  }, [sessions]);

  // 수강신청 대기 중인 세션들
  const pendingEnrollmentSessions = useMemo(() => {
    if (!principalData?.enrollments || !principalData?.classes) return [];

    const pendingEnrollments = principalData.enrollments.filter(
      (enrollment) => enrollment.status === "PENDING"
    );

    // 세션별로 그룹화
    const sessionMap = new Map();
    pendingEnrollments.forEach((enrollment) => {
      const sessionId = enrollment.sessionId;
      if (!sessionMap.has(sessionId)) {
        // enrollment.session에서 세션 정보 가져오기
        const sessionInfo = {
          sessionId,
          className: enrollment.session?.class?.className || "클래스명 없음",
          date: enrollment.session?.date || "",
          startTime: enrollment.session?.startTime || "",
          endTime: enrollment.session?.endTime || "",
          level: "BEGINNER", // 기본값
          teacherName: enrollment.session?.class?.teacher?.name || "미지정",
          currentStudents: 0, // 기본값
          maxStudents: 0, // 기본값
          pendingCount: 0,
          enrollments: [],
        };
        sessionMap.set(sessionId, sessionInfo);
      }
      const session = sessionMap.get(sessionId);
      if (session) {
        session.pendingCount++;
        session.enrollments.push(enrollment);
      }
    });

    return Array.from(sessionMap.values());
  }, [principalData?.enrollments, principalData?.classes]);

  // 환불요청 대기 중인 세션들
  const pendingRefundSessions = useMemo(() => {
    if (!principalData?.refundRequests || !principalData?.classes) return [];

    const pendingRefunds = principalData.refundRequests.filter(
      (refund) => refund.status === "PENDING"
    );

    // 세션별로 그룹화
    const sessionMap = new Map();
    pendingRefunds.forEach((refund: any) => {
      const sessionId =
        refund.sessionEnrollment?.session?.id ||
        refund.sessionId ||
        refund.classId ||
        0;
      if (!sessionMap.has(sessionId)) {
        // refund.sessionEnrollment.session에서 세션 정보 가져오기
        const sessionInfo = {
          sessionId,
          className:
            refund.sessionEnrollment?.session?.class?.className ||
            "클래스명 없음",
          date: refund.sessionEnrollment?.session?.date || "",
          startTime: refund.sessionEnrollment?.session?.startTime || "",
          endTime: refund.sessionEnrollment?.session?.endTime || "",
          level: "BEGINNER", // 기본값
          teacherName:
            refund.sessionEnrollment?.session?.class?.teacher?.name || "미지정",
          currentStudents: 0, // 기본값
          maxStudents: 0, // 기본값
          pendingCount: 0,
          refundRequests: [],
        };
        sessionMap.set(sessionId, sessionInfo);
      }
      const session = sessionMap.get(sessionId);
      if (session) {
        session.pendingCount++;
        session.refundRequests.push(refund);
      }
    });

    return Array.from(sessionMap.values());
  }, [principalData?.refundRequests, principalData?.classes]);

  // 특정 세션의 수강신청 목록
  const getSessionEnrollments = useCallback(
    (sessionId: number) => {
      return (
        principalData?.enrollments?.filter(
          (enrollment) => enrollment.sessionId === sessionId
        ) || []
      );
    },
    [principalData?.enrollments]
  );

  // 특정 세션의 환불요청 목록
  const getSessionRefundRequests = useCallback(
    (sessionId: number) => {
      return (
        principalData?.refundRequests?.filter(
          (refund: any) => (refund.sessionId || refund.classId) === sessionId
        ) || []
      );
    },
    [principalData?.refundRequests]
  );

  // 특정 학생 정보
  const getStudentById = useCallback(
    (studentId: number) => {
      return principalData?.students?.find(
        (student) => student.id === studentId
      );
    },
    [principalData?.students]
  );

  // 특정 선생님 정보
  const getTeacherById = useCallback(
    (teacherId: number) => {
      return principalData?.teachers?.find(
        (teacher) => teacher.id === teacherId
      );
    },
    [principalData?.teachers]
  );

  // 특정 클래스 정보
  const getClassById = useCallback(
    (classId: number) => {
      return principalData?.classes?.find((cls) => cls.id === classId);
    },
    [principalData?.classes]
  );

  // 특정 날짜의 세션들 가져오기
  const getSessionsByDate = useCallback(
    (date: Date) => {
      if (!sessions) return [];

      const result = sessions.filter((session: any) => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString();
      });

      console.log("getSessionsByDate - date:", date);
      console.log("getSessionsByDate - sessions:", sessions);
      console.log("getSessionsByDate - result:", result);
      return result;
    },
    [sessions]
  );

  // 특정 세션 정보 가져오기
  const getSessionById = useCallback(
    (sessionId: number) => {
      if (!principalData?.classes) return null;

      // 모든 클래스의 classSessions에서 해당 sessionId를 찾기
      for (const cls of principalData.classes as any[]) {
        if (cls.classSessions) {
          const session = cls.classSessions.find(
            (s: any) => s.id === sessionId
          );
          if (session) {
            const result = {
              id: session.id,
              classId: session.classId,
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              currentStudents: session.currentStudents || 0,
              maxStudents: session.maxStudents || 0,
              class: {
                id: cls.id,
                className: cls.className,
                level: cls.level,
                tuitionFee: cls.tuitionFee?.toString() || "50000",
                teacher: {
                  id: cls.teacherId || 0,
                  name: cls.teacher?.name || "선생님",
                },
              },
            };
            console.log("getSessionById - sessionId:", sessionId);
            console.log("getSessionById - result:", result);
            return result;
          }
        }
      }

      console.log("getSessionById - sessionId:", sessionId);
      console.log("getSessionById - not found");
      return null;
    },
    [principalData?.classes]
  );

  return {
    // 기본 데이터
    user,
    userProfile: principalData?.userProfile,
    academy: principalData?.academy,
    enrollments: principalData?.enrollments,
    refundRequests: principalData?.refundRequests,
    classes: principalData?.classes,
    teachers: principalData?.teachers,
    students: principalData?.students,
    sessions, // 추가: 세션 형태로 변환된 데이터
    calendarSessions, // 추가: 캘린더용 세션 데이터
    isLoading,
    error,

    // 파생 데이터
    pendingEnrollmentSessions,
    pendingRefundSessions,

    // 헬퍼 함수들
    getSessionEnrollments,
    getSessionRefundRequests,
    getStudentById,
    getTeacherById,
    getClassById,
    getSessionsByDate, // 추가: 날짜별 세션 필터링
    getSessionById, // 추가: 세션 ID로 세션 찾기
  };
}
