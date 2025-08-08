import { useAppSelector } from "@/store/hooks";
import { useMemo, useCallback } from "react";

// Principal 실시간 데이터 훅 (Redux 기반)
export function usePrincipalData() {
  const {
    data: principalData,
    isLoading,
    error,
  } = useAppSelector((state) => state.principal);

  // 수강신청 대기 중인 세션들
  const pendingEnrollmentSessions = useMemo(() => {
    if (!principalData?.enrollments) return [];

    const pendingEnrollments = principalData.enrollments.filter(
      (enrollment) => enrollment.status === "PENDING"
    );

    // 세션별로 그룹화
    const sessionMap = new Map();
    pendingEnrollments.forEach((enrollment) => {
      const sessionId = enrollment.sessionId;
      if (!sessionMap.has(sessionId)) {
        const sessionInfo = {
          sessionId,
          className: enrollment.session?.class?.className || "클래스명 없음",
          date: enrollment.session?.date || "",
          startTime: enrollment.session?.startTime || "",
          endTime: enrollment.session?.endTime || "",
          level: "BEGINNER",
          teacherName: enrollment.session?.class?.teacher?.name || "미지정",
          currentStudents: 0,
          maxStudents: 0,
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
  }, [principalData?.enrollments]);

  // 환불요청 대기 중인 세션들
  const pendingRefundSessions = useMemo(() => {
    if (!principalData?.refundRequests) return [];

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
        const sessionInfo = {
          sessionId,
          className:
            refund.sessionEnrollment?.session?.class?.className ||
            "클래스명 없음",
          date: refund.sessionEnrollment?.session?.date || "",
          startTime: refund.sessionEnrollment?.session?.startTime || "",
          endTime: refund.sessionEnrollment?.session?.endTime || "",
          level: "BEGINNER",
          teacherName:
            refund.sessionEnrollment?.session?.class?.teacher?.name || "미지정",
          currentStudents: 0,
          maxStudents: 0,
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
  }, [principalData?.refundRequests]);

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
          (refund: any) => refund.sessionEnrollment?.session?.id === sessionId
        ) || []
      );
    },
    [principalData?.refundRequests]
  );

  // 수강신청 통계
  const enrollmentStats = useMemo(() => {
    if (!principalData?.enrollments) {
      return { total: 0, pending: 0, confirmed: 0, rejected: 0 };
    }

    const stats = {
      total: principalData.enrollments.length,
      pending: principalData.enrollments.filter((e) => e.status === "PENDING")
        .length,
      confirmed: principalData.enrollments.filter(
        (e) => e.status === "CONFIRMED"
      ).length,
      rejected: principalData.enrollments.filter((e) => e.status === "REJECTED")
        .length,
    };

    return stats;
  }, [principalData?.enrollments]);

  // 환불요청 통계
  const refundStats = useMemo(() => {
    if (!principalData?.refundRequests) {
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }

    const stats = {
      total: principalData.refundRequests.length,
      pending: principalData.refundRequests.filter(
        (r) => r.status === "PENDING"
      ).length,
      approved: principalData.refundRequests.filter(
        (r) => r.status === "APPROVED"
      ).length,
      rejected: principalData.refundRequests.filter(
        (r) => r.status === "REJECTED"
      ).length,
    };

    return stats;
  }, [principalData?.refundRequests]);

  return {
    // 실시간 데이터
    enrollments: principalData?.enrollments || [],
    refundRequests: principalData?.refundRequests || [],
    isLoading,
    error,

    // 파생 데이터
    pendingEnrollmentSessions,
    pendingRefundSessions,
    enrollmentStats,
    refundStats,

    // 헬퍼 함수들
    getSessionEnrollments,
    getSessionRefundRequests,
  };
}
