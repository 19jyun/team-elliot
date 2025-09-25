import { getSession as apiGetSession } from "@/api/auth";
import { toSession, toSessionVM, isValidSession } from "@/lib/adapters/session";
import type { SessionVM, SessionServiceInterface } from "@/types/view/session";
import type { Session } from "@/lib/auth/AuthProvider";

/**
 * 세션 관리를 위한 서비스 클래스
 */
export class SessionService implements SessionServiceInterface {
  private viewModel: SessionVM;
  private cache: SessionVM | null = null;
  private cacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

  constructor() {
    this.viewModel = {
      session: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
      accessToken: undefined,
      timeUntilExpiry: 0,
      isTokenExpiringSoon: false,
    };
  }

  /**
   * 현재 세션 상태 반환
   */
  getViewModel(): SessionVM {
    return this.viewModel;
  }

  /**
   * 세션 정보 조회 (캐싱 적용)
   */
  async fetchSession(): Promise<SessionVM> {
    const now = Date.now();

    // 캐시가 유효한 경우
    if (this.cache && now - this.cacheTime < this.CACHE_DURATION) {
      this.viewModel = this.cache;
      return this.viewModel;
    }

    this.viewModel.isLoading = true;
    this.viewModel.error = null;

    try {
      // API에서 세션 정보 조회
      const apiResponse = await apiGetSession();

      if (apiResponse?.data) {
        // SessionResponse를 Session으로 변환
        const session = toSession(apiResponse.data);
        this.viewModel = toSessionVM(session);

        // 캐시 업데이트
        this.cache = this.viewModel;
        this.cacheTime = now;
      } else {
        this.viewModel = toSessionVM(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "세션 조회 실패";
      this.viewModel = {
        ...this.viewModel,
        session: null,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        accessToken: undefined,
        timeUntilExpiry: 0,
        isTokenExpiringSoon: false,
      };
    } finally {
      this.viewModel.isLoading = false;
    }

    return this.viewModel;
  }

  /**
   * 세션 업데이트
   */
  updateSession(updates: Partial<Session>): void {
    if (!this.viewModel.session) return;

    const updatedSession = {
      ...this.viewModel.session,
      ...updates,
      user: {
        ...this.viewModel.session.user,
        ...updates.user,
      },
    };

    this.viewModel = toSessionVM(updatedSession);

    // 캐시도 업데이트
    if (this.cache) {
      this.cache = this.viewModel;
    }
  }

  /**
   * 세션 클리어
   */
  clearSession(): void {
    this.viewModel = toSessionVM(null);
    this.cache = null;
    this.cacheTime = 0;
  }

  /**
   * 캐시 무효화
   */
  invalidateCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }

  /**
   * 세션 유효성 검증
   */
  validateSession(): boolean {
    return isValidSession(this.viewModel.session);
  }

  /**
   * 토큰 갱신 필요 여부 확인
   */
  needsTokenRefresh(): boolean {
    return this.viewModel.isTokenExpiringSoon;
  }

  /**
   * 세션 상태를 로그용으로 반환
   */
  getSessionInfo(): object {
    return {
      isAuthenticated: this.viewModel.isAuthenticated,
      userId: this.viewModel.user?.id,
      userName: this.viewModel.user?.name,
      userRole: this.viewModel.user?.role,
      hasToken: !!this.viewModel.accessToken,
      timeUntilExpiry: this.viewModel.timeUntilExpiry,
      isExpiringSoon: this.viewModel.isTokenExpiringSoon,
    };
  }
}
