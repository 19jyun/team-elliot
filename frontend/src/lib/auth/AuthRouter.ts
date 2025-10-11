/**
 * Next.js App Router의 router 타입
 */
interface NextRouter {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
}

/**
 * 간단한 인증 라우팅 유틸리티
 */
export class AuthRouter {
  private static router: NextRouter | null = null;

  /**
   * Next.js router 설정
   */
  static setRouter(router: NextRouter): void {
    AuthRouter.router = router;
  }

  /**
   * 대시보드로 리디렉션
   */
  static redirectToDashboard(): void {
    if (AuthRouter.router) {
      AuthRouter.router.replace("/dashboard");
    } else {
      // 폴백: window.location 사용
      if (typeof window !== "undefined") {
        console.log("🔄 window.location.href = /dashboard 실행됨");
        window.location.href = "/dashboard";
      }
    }
  }

  /**
   * 로그인 페이지로 리디렉션
   */
  static redirectToLogin(): void {
    if (AuthRouter.router) {
      AuthRouter.router.replace("/");
    } else {
      // 폴백: window.location 사용
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }
}
