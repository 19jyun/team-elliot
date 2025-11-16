import type { UseQueryOptions } from "@tanstack/react-query";

/**
 * 공통 Query Options
 *
 * 자주 사용되는 Query 설정을 재사용 가능한 옵션으로 제공
 */

/**
 * 기본 Query Options
 */
export const defaultQueryOptions: Partial<
  UseQueryOptions<unknown, Error, unknown, unknown[]>
> = {
  staleTime: 30 * 1000, // 30초
  gcTime: 5 * 60 * 1000, // 5분
  retry: 1,
  refetchOnWindowFocus: false,
};

/**
 * 자주 변경되지 않는 데이터용 Query Options
 * (프로필, 학원 정보 등)
 */
export const stableQueryOptions: Partial<
  UseQueryOptions<unknown, Error, unknown, unknown[]>
> = {
  staleTime: 5 * 60 * 1000, // 5분
  gcTime: 10 * 60 * 1000, // 10분
  retry: 1,
  refetchOnWindowFocus: false,
};

/**
 * 실시간 업데이트가 필요한 데이터용 Query Options
 * (수강신청, 환불 요청 등)
 */
export const realtimeQueryOptions: Partial<
  UseQueryOptions<unknown, Error, unknown, unknown[]>
> = {
  staleTime: 10 * 1000, // 10초
  gcTime: 2 * 60 * 1000, // 2분
  retry: 1,
  refetchOnWindowFocus: false,
  refetchInterval: false, // Socket으로 실시간 업데이트하므로 polling 비활성화
};

/**
 * 캘린더 세션용 Query Options
 */
export const calendarQueryOptions: Partial<
  UseQueryOptions<unknown, Error, unknown, unknown[]>
> = {
  staleTime: 2 * 60 * 1000, // 2분
  gcTime: 5 * 60 * 1000, // 5분
  retry: 1,
  refetchOnWindowFocus: false,
};
