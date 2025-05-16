import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req })
  const path = req.nextUrl.pathname

  console.log('Middleware - Current path:', path)
  console.log('Middleware - Token:', token)

  // 로그인이 필요한 페이지에 대한 체크
  if (!token && path !== '/login' && !path.startsWith('/signup')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 이미 로그인한 사용자의 접근 제한
  if (
    token &&
    (path === '/' || path === '/login' || path.startsWith('/signup'))
  ) {
    const role = token.role?.toLowerCase()
    const redirectPath = {
      student: '/dashboard/student',
      teacher: '/dashboard/teacher',
      admin: '/dashboard/admin',
    }[role]

    if (redirectPath) {
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  // 권한별 접근 제어
  if (token && path.startsWith('/dashboard/')) {
    const role = token.role?.toLowerCase()
    const allowedPath = `/dashboard/${role}`

    if (path !== allowedPath && !path.startsWith(allowedPath + '/')) {
      return NextResponse.redirect(new URL(allowedPath, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
