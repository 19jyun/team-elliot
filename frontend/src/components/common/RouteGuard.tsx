'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (status === 'loading') {
      return;
    }

    // 이미 리다이렉트 중이면 중복 실행 방지
    if (isRedirecting) {
      return;
    }

    // 인증된 사용자
    if (session?.accessToken) {
      // 현재 경로가 /auth이거나 루트 경로인 경우 /dashboard로 리다이렉트
      if (pathname === '/auth' || pathname === '/') {
        setIsRedirecting(true);
        router.replace('/dashboard');
        return;
      }
    } else {
      // 인증되지 않은 사용자
      // /auth가 아닌 모든 경로를 /auth로 리다이렉트
      if (pathname !== '/auth') {
        setIsRedirecting(true);
        router.replace('/auth');
        return;
      }
    }
  }, [session, status, pathname, router, isRedirecting]);

  // 리다이렉트 완료 후 상태 초기화
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isRedirecting]);

  // 로딩 중일 때 로딩 화면 표시
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 리다이렉트 중일 때 로딩 화면 표시
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">페이지 이동 중...</p>
        </div>
      </div>
    );
  }

  // 정상적인 경우 children 렌더링
  return <>{children}</>;
} 