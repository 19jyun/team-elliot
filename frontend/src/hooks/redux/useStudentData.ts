import { useAppSelector } from "@/store/hooks";
import { useMemo, useCallback } from "react";

// Student 대시보드에서 사용할 데이터 훅 (Redux에서 관리하는 데이터만)
export function useStudentData() {
  const {
    data: studentData,
    isLoading,
    error,
  } = useAppSelector((state) => state.student);

  // 수강 신청/결제 내역 (EnrollmentHistory용)
  const enrollmentHistory = useMemo(() => {
    return studentData?.enrollmentHistory || [];
  }, [studentData?.enrollmentHistory]);

  // 환불/취소 내역 (CancellationHistory용)
  const cancellationHistory = useMemo(() => {
    return studentData?.cancellationHistory || [];
  }, [studentData?.cancellationHistory]);

  // 헬퍼 함수들
  const getEnrollmentById = useCallback(
    (enrollmentId: number) => {
      return studentData?.enrollmentHistory.find(
        (enrollment: any) => enrollment.id === enrollmentId
      );
    },
    [studentData?.enrollmentHistory]
  );

  const getCancellationById = useCallback(
    (cancellationId: number) => {
      return studentData?.cancellationHistory.find(
        (cancellation: any) => cancellation.id === cancellationId
      );
    },
    [studentData?.cancellationHistory]
  );

  return {
    // 기본 데이터
    enrollmentHistory,
    cancellationHistory,

    // 상태
    isLoading,
    error,

    // 헬퍼 함수들
    getEnrollmentById,
    getCancellationById,
  };
}
