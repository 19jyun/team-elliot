// Session API DTO → ViewModel 어댑터 함수들

import type { SessionResponse } from "@/types/api/auth";
import type { Session } from "@/lib/auth/AuthProvider";
import type { SessionVM } from "../../types/view/session";

// ============= 세션 변환 함수들 =============

/**
 * API 응답을 AuthProvider Session으로 변환
 */
export function toSession(apiResponse: SessionResponse): Session {
  return {
    user: {
      id: apiResponse.user.id.toString(), // number → string
      name: apiResponse.user.name,
      role: apiResponse.user.role,
      email: undefined, // API에서 제공하지 않음
    },
    accessToken: apiResponse.accessToken,
    error: undefined,
    expiresAt: apiResponse.expiresAt,
  };
}

/**
 * API 응답이 null인 경우 처리
 */
export function toSessionOrNull(
  apiResponse: SessionResponse | null
): Session | null {
  return apiResponse ? toSession(apiResponse) : null;
}

/**
 * Session을 API 요청용 데이터로 변환 (필요시)
 */
export function toApiRequest(session: Session): { userId: string } {
  return {
    userId: session.user.id,
  };
}

// ============= 세션 유틸리티 함수들 =============

/**
 * 세션 유효성 검증
 */
export function isValidSession(session: Session | null): boolean {
  if (!session) return false;
  if (!session.user?.id) return false;
  if (!session.accessToken) return false;
  if (session.expiresAt && session.expiresAt < Date.now()) return false;
  return true;
}

/**
 * 토큰 만료까지 남은 시간 (밀리초)
 */
export function getTimeUntilExpiry(session: Session | null): number {
  if (!session?.expiresAt) return 0;
  return Math.max(0, session.expiresAt - Date.now());
}

/**
 * 토큰이 곧 만료되는지 확인 (5분 이내)
 */
export function isTokenExpiringSoon(session: Session | null): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(session);
  return timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000; // 5분
}

/**
 * Session을 ViewModel로 변환
 */
export function toSessionVM(session: Session | null): SessionVM {
  return {
    session,
    isLoading: false,
    error: null,
    isAuthenticated: isValidSession(session),
    user: session?.user || null,
    accessToken: session?.accessToken,
    timeUntilExpiry: getTimeUntilExpiry(session),
    isTokenExpiringSoon: isTokenExpiringSoon(session),
  };
}

/**
 * 세션 정보를 로그용으로 포맷
 */
export function toLogFormat(session: Session | null): object {
  return {
    isAuthenticated: isValidSession(session),
    userId: session?.user?.id,
    userName: session?.user?.name,
    userRole: session?.user?.role,
    hasToken: !!session?.accessToken,
    timeUntilExpiry: getTimeUntilExpiry(session),
    isExpiringSoon: isTokenExpiringSoon(session),
  };
}
