import { useAppSelector } from "@/store/hooks";

// Student 대시보드에서 사용할 데이터 훅 (추후 구현 예정)
export function useStudentData() {
  const { user, studentData, isLoading, error } = useAppSelector(
    (state) => state.appData
  );

  // TODO: Student 전용 데이터 로직 구현 예정
  // - 수강신청 목록
  // - 수강 중인 클래스 목록
  // - 결제 내역
  // - 출석 기록
  // - 성적 정보 등

  return {
    user,
    studentData,
    isLoading,
    error,
    // 추후 Student 전용 데이터 및 헬퍼 함수들 추가 예정
  };
}
