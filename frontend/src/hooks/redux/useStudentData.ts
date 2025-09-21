import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useMemo, useCallback } from "react";
import { clearError } from "@/store/slices/studentSlice";
import type {
  EnrollmentHistory,
  CancellationHistory,
} from "@/types/api/student";

// Student 대시보드에서 사용할 데이터 훅 (Redux에서 관리하는 데이터만)
export function useStudentData() {
  const dispatch = useAppDispatch();
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
    (enrollmentId: number): EnrollmentHistory | undefined => {
      return studentData?.enrollmentHistory.find(
        (enrollment: EnrollmentHistory) => enrollment.id === enrollmentId
      );
    },
    [studentData?.enrollmentHistory]
  );

  const getCancellationById = useCallback(
    (cancellationId: number): CancellationHistory | undefined => {
      return studentData?.cancellationHistory.find(
        (cancellation: CancellationHistory) =>
          cancellation.id === cancellationId
      );
    },
    [studentData?.cancellationHistory]
  );

  // 에러 초기화 함수
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

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
    clearErrorState,
  };
}
