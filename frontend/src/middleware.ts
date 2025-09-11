import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 토큰 확인
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // 허용된 경로들 (오직 /auth와 /dashboard만 허용)
  const allowedPaths = ["/auth", "/dashboard"];

  // API 경로는 제외
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 정적 파일들은 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 현재 경로가 허용된 경로인지 확인
  const isAllowedPath = allowedPaths.some((path) => pathname === path);

  // 허용된 경로가 아닌 경우 리다이렉트
  if (!isAllowedPath) {
    if (token) {
      // 로그인된 사용자 → /dashboard로 리다이렉트
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      // 로그인되지 않은 사용자 → /auth로 리다이렉트
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // /auth 경로에 로그인된 사용자가 접근하는 경우
  if (pathname === "/auth" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // /dashboard 경로에 로그인되지 않은 사용자가 접근하는 경우
  if (pathname === "/dashboard" && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
