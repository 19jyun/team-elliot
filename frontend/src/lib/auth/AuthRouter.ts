import { ensureTrailingSlash } from "@/lib/utils/router";

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
   * 역할 기반 대시보드 경로 가져오기
   */
  private static getDashboardPath(role?: string): string {
    if (!role) {
      return "/dashboard/";
    }

    const roleLower = role.toUpperCase();
    switch (roleLower) {
      case "STUDENT":
        return "/dashboard/student/";
      case "TEACHER":
        return "/dashboard/teacher/";
      case "PRINCIPAL":
        return "/dashboard/principal/";
      default:
        return "/dashboard/";
    }
  }

  /**
   * 대시보드로 리디렉션 (역할 기반, 재시도 메커니즘 포함)
   * Capacitor 환경에서도 안정적으로 작동하도록 개선
   */
  static redirectToDashboard(role?: string): void {
    AuthRouter.redirectAttempts++;
    const dashboardPath = AuthRouter.getDashboardPath(role);

    // 1순위: AuthRouter에 설정된 router 사용
    if (AuthRouter.router) {
      try {
        const pathWithSlash = ensureTrailingSlash(dashboardPath);
        AuthRouter.router.replace(pathWithSlash);
        console.log(`✅ AuthRouter를 통한 리디렉션 성공: ${pathWithSlash}`);
        AuthRouter.redirectAttempts = 0; // 성공 시 카운터 리셋
        return;
      } catch (error) {
        console.error("❌ AuthRouter 리디렉션 실패:", error);
        AuthRouter.handleRedirectFailure(dashboardPath);
        return;
      }
    }

    // 2순위: window.location 사용 (폴백)
    if (typeof window !== "undefined") {
      try {
        // Capacitor 환경 감지
        interface WindowWithCapacitor extends Window {
          Capacitor?: {
            isNativePlatform?: () => boolean;
            getPlatform?: () => string;
          };
        }
        const win = window as WindowWithCapacitor;
        const isCapacitor =
          window.location.protocol === "capacitor:" ||
          win.Capacitor !== undefined;

        const pathWithSlash = ensureTrailingSlash(dashboardPath);
        if (isCapacitor) {
          // Capacitor 환경에서는 window.location.replace 사용 (더 안정적)
          console.log(
            `🔄 Capacitor 환경: window.location.replace(${pathWithSlash}) 실행됨`
          );
          window.location.replace(pathWithSlash);
        } else {
          // 웹 환경에서는 window.location.href 사용
          console.log(`🔄 window.location.href = ${pathWithSlash} 실행됨`);
          window.location.href = pathWithSlash;
        }
        AuthRouter.redirectAttempts = 0; // 성공 시 카운터 리셋
      } catch (error) {
        console.error("❌ window.location 리디렉션 실패:", error);
        AuthRouter.handleRedirectFailure(dashboardPath);
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

    const loginPath = ensureTrailingSlash("/");
    if (AuthRouter.router) {
      try {
        AuthRouter.router.replace(loginPath);
        console.log("✅ AuthRouter를 통한 로그인 페이지 리디렉션 성공");
        AuthRouter.redirectAttempts = 0; // 성공 시 카운터 리셋
      } catch (error) {
        console.error("❌ AuthRouter 로그인 페이지 리디렉션 실패:", error);
        AuthRouter.handleRedirectFailure("/");
      }
    } else {
      // 폴백: window.location 사용
      if (typeof window !== "undefined") {
        console.log(`🔄 window.location.href = ${loginPath} 실행됨`);
        try {
          window.location.href = loginPath;
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
