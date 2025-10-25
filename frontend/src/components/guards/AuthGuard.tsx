'use client';

import React from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { AuthRouter } from '@/lib/auth/AuthRouter';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

function LoadingSpinner({ message = '로딩 중...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-stone-700 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * 간단한 인증 가드 컴포넌트
 */
export function AuthGuard({ 
  children, 
  requireAuth = true,
  fallback 
}: AuthGuardProps) {
  const { data: session, status } = useSession();

  // 모든 useEffect를 최상단에서 호출 (Hooks 규칙 준수)
  React.useEffect(() => {
    // 인증이 필요한데 로그인되지 않은 경우
    if (requireAuth && !session?.user && status !== 'loading') {
      AuthRouter.redirectToLogin();
    }
  }, [requireAuth, session?.user, status]);


  // 로딩 상태
  if (status === 'loading') {
    return fallback || <LoadingSpinner message="세션 확인 중..." size="md" />;
  }

  // 인증이 필요한데 로그인되지 않은 경우
  if (requireAuth && !session?.user) {
    return fallback || <LoadingSpinner message="인증이 필요합니다." size="sm" />;
  }

  return <>{children}</>;
}
