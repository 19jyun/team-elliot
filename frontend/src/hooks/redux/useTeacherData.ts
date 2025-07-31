import { useAppSelector } from "@/store/hooks";

// Teacher 대시보드에서 사용할 데이터 훅 (추후 구현 예정)
export function useTeacherData() {
  const { user, teacherData, isLoading, error } = useAppSelector(
    (state) => state.appData
  );

  // TODO: Teacher 전용 데이터 로직 구현 예정
  // - 담당 클래스 목록
  // - 수강생 목록
  // - 수업 일정
  // - 학생 평가
  // - 출석 관리 등

  return {
    user,
    teacherData,
    isLoading,
    error,
    // 추후 Teacher 전용 데이터 및 헬퍼 함수들 추가 예정
  };
}
