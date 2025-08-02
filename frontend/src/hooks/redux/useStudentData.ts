import { useAppSelector } from "@/store/hooks";
import { useMemo, useCallback } from "react";

// Student 대시보드에서 사용할 데이터 훅
export function useStudentData() {
  const {
    data: studentData,
    isLoading,
    error,
  } = useAppSelector((state) => state.student);

  // Student 전용 데이터 로직
  // - 수강신청 목록
  // - 수강 중인 클래스 목록
  // - 결제 내역
  // - 출석 기록
  // - 성적 정보 등

  // 캘린더용 세션 데이터 변환 (ConnectedCalendar에서 사용)
  const convertedSessions = useMemo(() => {
    if (
      !studentData?.sessionClasses ||
      studentData.sessionClasses.length === 0
    ) {
      console.log("No session classes found in Redux store");
      return [];
    }

    return studentData.sessionClasses.map((session: any) => ({
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
    }));
  }, [studentData?.sessionClasses]);

  // 캘린더 범위 계산
  const calendarRange = useMemo(() => {
    if (!studentData?.calendarRange) {
      // 백엔드에서 범위를 받지 못한 경우 기본값 사용
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
      };
    }

    return {
      startDate: new Date(studentData.calendarRange.startDate),
      endDate: new Date(studentData.calendarRange.endDate),
    };
  }, [studentData?.calendarRange]);

  // 수강중인 클래스 목록 (EnrolledClassesContainer용)
  const enrolledClasses = useMemo(() => {
    return studentData?.enrollmentClasses || [];
  }, [studentData?.enrollmentClasses]);

  // 수강 신청/결제 내역 (EnrollmentHistory용)
  const enrollmentHistory = useMemo(() => {
    return studentData?.enrollmentHistory || [];
  }, [studentData?.enrollmentHistory]);

  // 환불/취소 내역 (CancellationHistory용)
  const cancellationHistory = useMemo(() => {
    return studentData?.cancellationHistory || [];
  }, [studentData?.cancellationHistory]);

  // 가입한 학원 목록 (EnrollmentAcademyStep용)
  const academies = useMemo(() => {
    return studentData?.academies || [];
  }, [studentData?.academies]);

  // 수강 가능한 클래스 목록 (EnrollmentClassStep용)
  const availableClasses = useMemo(() => {
    return studentData?.availableClasses || [];
  }, [studentData?.availableClasses]);

  // 수강 가능한 세션 목록 (EnrollmentDateStep용)
  const availableSessions = useMemo(() => {
    return studentData?.availableSessions || [];
  }, [studentData?.availableSessions]);

  // 수강신청 진행 상태
  const enrollmentProgress = useMemo(() => {
    return (
      studentData?.enrollmentProgress || {
        currentStep: "academy-selection",
      }
    );
  }, [studentData?.enrollmentProgress]);

  // 헬퍼 함수들
  const getClassById = useCallback(
    (classId: number) => {
      return studentData?.enrollmentClasses.find((cls) => cls.id === classId);
    },
    [studentData?.enrollmentClasses]
  );

  const getSessionById = useCallback(
    (sessionId: number) => {
      return studentData?.sessionClasses.find(
        (session) => session.id === sessionId
      );
    },
    [studentData?.sessionClasses]
  );

  const getAvailableClassById = useCallback(
    (classId: number) => {
      return studentData?.availableClasses.find((cls) => cls.id === classId);
    },
    [studentData?.availableClasses]
  );

  const getAvailableSessionById = useCallback(
    (sessionId: number) => {
      return studentData?.availableSessions.find(
        (session) => session.id === sessionId
      );
    },
    [studentData?.availableSessions]
  );

  const getEnrollmentById = useCallback(
    (enrollmentId: number) => {
      return studentData?.enrollmentHistory.find(
        (enrollment) => enrollment.id === enrollmentId
      );
    },
    [studentData?.enrollmentHistory]
  );

  const getCancellationById = useCallback(
    (cancellationId: number) => {
      return studentData?.cancellationHistory.find(
        (cancellation) => cancellation.id === cancellationId
      );
    },
    [studentData?.cancellationHistory]
  );

  // 날짜별 세션 조회 함수 (DateSessionModal용)
  const getSessionsByDate = useCallback(
    (date: Date) => {
      if (!convertedSessions || convertedSessions.length === 0) return [];

      const targetDate = date.toISOString().split("T")[0]; // YYYY-MM-DD 형식

      return convertedSessions.filter((session) => {
        const sessionDate = new Date(session.date).toISOString().split("T")[0];
        return sessionDate === targetDate;
      });
    },
    [convertedSessions]
  );

  return {
    // 기본 데이터
    userProfile: studentData?.userProfile,
    academies,
    enrollmentClasses: studentData?.enrollmentClasses || [],
    sessionClasses: studentData?.sessionClasses || [],
    availableClasses,
    availableSessions,
    enrollmentHistory,
    cancellationHistory,
    calendarRange,
    enrollmentProgress,

    // 변환된 데이터
    convertedSessions,
    enrolledClasses,

    // 상태
    isLoading,
    error,

    // 헬퍼 함수들
    getClassById,
    getSessionById,
    getAvailableClassById,
    getAvailableSessionById,
    getEnrollmentById,
    getCancellationById,
    getSessionsByDate,

    // 추후 Student 전용 데이터 및 헬퍼 함수들 추가 예정
  };
}
