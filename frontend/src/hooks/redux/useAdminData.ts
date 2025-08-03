import { useAppSelector } from "@/store/hooks";

// Admin 대시보드에서 사용할 데이터 훅 (추후 구현 예정)
export function useAdminData() {
  const { user, adminData, isLoading, error } = useAppSelector(
    (state) => state.appData
  );

  // TODO: Admin 전용 데이터 로직 구현 예정
  // - 전체 학생 관리
  // - 전체 선생님 관리
  // - 전체 클래스 관리
  // - 시스템 통계
  // - 권한 관리 등

  return {
    user,
    adminData,
    isLoading,
    error,
    // 추후 Admin 전용 데이터 및 헬퍼 함수들 추가 예정
  };
}
