import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로들
  const protectedPaths = ["/dashboard", "/profile", "/enrollment"];

  // 인증이 필요하지 않은 경로들
  const publicPaths = ["/auth", "/api"];

  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 현재 경로가 공개 경로인지 확인
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 토큰 확인
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // 보호된 경로에 접근하려고 하는데 토큰이 없는 경우
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 이미 로그인된 사용자가 인증 페이지에 접근하려는 경우
  if (token && pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
