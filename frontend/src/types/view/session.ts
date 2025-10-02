import type { Session } from "@/lib/auth/AuthProvider";

/**
 * Session ViewModel 타입 정의
 */
export interface SessionVM {
  /** 현재 세션 정보 */
  session: Session | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 인증 상태 */
  isAuthenticated: boolean;
  /** 사용자 정보 */
  user: Session["user"] | null;
  /** 액세스 토큰 */
  accessToken: string | undefined;
  /** 토큰 만료까지 남은 시간 (밀리초) */
  timeUntilExpiry: number;
  /** 토큰이 곧 만료되는지 여부 (5분 이내) */
  isTokenExpiringSoon: boolean;
}

/**
 * Session 상태 타입
 */
export type SessionStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

/**
 * Session 액션 타입
 */
export interface SessionActions {
  /** 세션 설정 */
  setSession: (session: Session | null) => void;
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
  /** 에러 설정 */
  setError: (error: string | null) => void;
  /** 세션 클리어 */
  clearSession: () => void;
  /** 세션 업데이트 */
  updateSession: (updates: Partial<Session>) => void;
  /** 세션 리셋 */
  reset: () => void;
}

/**
 * Session Hook 반환 타입
 */
export interface UseSessionReturn extends SessionVM, SessionActions {
  /** 세션 상태 */
  status: SessionStatus;
  /** 세션 정보를 로그용으로 포맷 */
  toLogFormat: () => object;
}

/**
 * Session Service 인터페이스
 */
export interface SessionServiceInterface {
  /** ViewModel 반환 */
  getViewModel(): SessionVM;
  /** 세션 조회 */
  fetchSession(): Promise<SessionVM>;
  /** 세션 업데이트 */
  updateSession(updates: Partial<Session>): void;
  /** 세션 클리어 */
  clearSession(): void;
  /** 캐시 무효화 */
  invalidateCache(): void;
  /** 세션 유효성 검증 */
  validateSession(): boolean;
  /** 토큰 갱신 필요 여부 확인 */
  needsTokenRefresh(): boolean;
  /** 세션 정보 반환 */
  getSessionInfo(): object;
}
