import { QueryClient } from "@tanstack/react-query";

/**
 * React Query QueryClient 설정
 *
 * 서버 상태 관리를 위한 중앙 설정
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 설정
      staleTime: 30 * 1000, // 30초 - 데이터가 fresh로 간주되는 시간
      gcTime: 5 * 60 * 1000, // 5분 - 캐시가 메모리에 유지되는 시간 (기존 cacheTime)
      retry: 1, // 실패 시 1번 재시도
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리패칭 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 리패칭
      refetchOnMount: true, // 컴포넌트 마운트 시 리패칭

      // 에러 처리: 전역 에러 핸들러는 apiClient의 인터셉터에서 처리
      // React Query v5에서는 onError가 defaultOptions에서 제거됨
      // 개별 쿼리/뮤테이션에서 onError 사용 권장
    },
    mutations: {
      // Mutation 기본 설정
      retry: 0, // Mutation은 재시도 안 함

      // 에러 처리: 전역 에러 핸들러는 apiClient의 인터셉터에서 처리
      // React Query v5에서는 onError가 defaultOptions에서 제거됨
      // 개별 뮤테이션에서 onError 사용 권장
    },
  },
});
