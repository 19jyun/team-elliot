import { useAppSelector } from "@/store/hooks";
import { useMemo, useCallback } from "react";

// Teacher 실시간 데이터 훅 (Redux 기반)
export function useTeacherData() {
  const {
    data: teacherRealTimeData,
    isLoading,
    error,
  } = useAppSelector((state) => state.teacher);

  // 출석체크용 enrollment 데이터
  const enrollments = useMemo(() => {
    return teacherRealTimeData?.enrollments || [];
  }, [teacherRealTimeData?.enrollments]);

  // 특정 세션의 수강생 목록 (출석체크용)
  const getSessionEnrollments = useCallback(
    (sessionId: number) => {
      return enrollments.filter(
        (enrollment) => enrollment.sessionId === sessionId
      );
    },
    [enrollments]
  );

  // 출석체크 통계
  const attendanceStats = useMemo(() => {
    const stats = {
      total: enrollments.length,
      present: enrollments.filter((e) => e.status === "ATTENDED").length,
      absent: enrollments.filter((e) => e.status === "ABSENT").length,
      pending: enrollments.filter((e) => e.status === "PENDING").length,
      confirmed: enrollments.filter((e) => e.status === "CONFIRMED").length,
    };
    return stats;
  }, [enrollments]);

  // 출석체크 가능한 enrollment 목록
  const checkableEnrollments = useMemo(() => {
    return enrollments.filter(
      (enrollment) =>
        enrollment.status === "CONFIRMED" ||
        enrollment.status === "ATTENDED" ||
        enrollment.status === "ABSENT"
    );
  }, [enrollments]);

  // 특정 세션의 출석체크 가능한 수강생 목록
  const getSessionCheckableEnrollments = useCallback(
    (sessionId: number) => {
      return getSessionEnrollments(sessionId).filter(
        (enrollment) =>
          enrollment.status === "CONFIRMED" ||
          enrollment.status === "ATTENDED" ||
          enrollment.status === "ABSENT"
      );
    },
    [getSessionEnrollments]
  );

  return {
    // 실시간 데이터
    enrollments,
    isLoading,
    error,

    // 파생 데이터
    attendanceStats,
    checkableEnrollments,

    // 헬퍼 함수들
    getSessionEnrollments,
    getSessionCheckableEnrollments,
  };
}
