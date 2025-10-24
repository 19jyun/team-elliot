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
  private static redirectAttempts = 0;
  private static maxRedirectAttempts = 3;

  /**
   * Next.js router 설정
   */
  static setRouter(router: NextRouter): void {
    AuthRouter.router = router;
  }

  /**
   * 대시보드로 리디렉션 (재시도 메커니즘 포함)
   */
  static redirectToDashboard(): void {
    AuthRouter.redirectAttempts++;

    if (AuthRouter.router) {
      try {
        AuthRouter.router.replace("/dashboard/");
        console.log("✅ AuthRouter를 통한 리디렉션 성공");
        AuthRouter.redirectAttempts = 0; // 성공 시 카운터 리셋
      } catch (error) {
        console.error("❌ AuthRouter 리디렉션 실패:", error);
        AuthRouter.handleRedirectFailure("/dashboard/");
      }
    } else {
      // 폴백: window.location 사용
      if (typeof window !== "undefined") {
        console.log("🔄 window.location.href = /dashboard 실행됨");
        try {
          window.location.href = "/dashboard/";
          AuthRouter.redirectAttempts = 0; // 성공 시 카운터 리셋
        } catch (error) {
          console.error("❌ window.location 리디렉션 실패:", error);
          AuthRouter.handleRedirectFailure("/dashboard/");
        }
      }
    }
  }

  /**
   * 리디렉션 실패 처리
   */
  private static handleRedirectFailure(targetPath: string): void {
    if (AuthRouter.redirectAttempts < AuthRouter.maxRedirectAttempts) {
      console.log(
        `🔄 리디렉션 재시도 ${AuthRouter.redirectAttempts}/${AuthRouter.maxRedirectAttempts}`
      );
      setTimeout(() => {
        if (targetPath === "/dashboard/") {
          AuthRouter.redirectToDashboard();
        } else {
          AuthRouter.redirectToLogin();
        }
      }, 200 * AuthRouter.redirectAttempts); // 지수적 백오프
    } else {
      console.error("❌ 최대 리디렉션 시도 횟수 초과");
      AuthRouter.redirectAttempts = 0; // 카운터 리셋
    }
  }

  /**
   * 로그인 페이지로 리디렉션 (재시도 메커니즘 포함)
   */
  static redirectToLogin(): void {
    AuthRouter.redirectAttempts++;

    if (AuthRouter.router) {
      try {
        AuthRouter.router.replace("/");
        console.log("✅ AuthRouter를 통한 로그인 페이지 리디렉션 성공");
        AuthRouter.redirectAttempts = 0; // 성공 시 카운터 리셋
      } catch (error) {
        console.error("❌ AuthRouter 로그인 페이지 리디렉션 실패:", error);
        AuthRouter.handleRedirectFailure("/");
      }
    } else {
      // 폴백: window.location 사용
      if (typeof window !== "undefined") {
        console.log("🔄 window.location.href = / 실행됨");
        try {
          window.location.href = "/";
          AuthRouter.redirectAttempts = 0; // 성공 시 카운터 리셋
        } catch (error) {
          console.error(
            "❌ window.location 로그인 페이지 리디렉션 실패:",
            error
          );
          AuthRouter.handleRedirectFailure("/");
        }
      }
    }
  }
}
