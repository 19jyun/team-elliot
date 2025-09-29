'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthProvider';
import { useApp } from '@/contexts/AppContext';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { LoginPage } from './pages/LoginPage';
import { SignupRolePage } from './pages/SignupRolePage';
import { SignupPersonalPage } from './pages/SignupPersonalPage';
import { SignupAccountPage } from './pages/SignupAccountPage';
import { SignupTermsPage } from './pages/SignupTermsPage';

export function AuthContainer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { form } = useApp();
  const { authMode, signup } = form.auth;

  // 세션 검증 및 리디렉션
  useEffect(() => {
    if (status === 'loading') return; // 로딩 중이면 대기
    
    if (session?.user) {
      // 로그인된 사용자 → /dashboard로 리다이렉트
      router.replace('/dashboard');
    }
    // 세션이 없으면 로그인 폼 표시 (기본 동작)
  }, [status, session, router]);

  // 세션 로딩 중이거나 이미 로그인된 사용자 리디렉션 중
  if (status === 'loading' || session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === 'loading' ? '세션 확인 중...' : '리디렉션 중...'}
          </p>
        </div>
      </div>
    );
  }

  // 기본 페이지 (로그인) - 뒤로가기 버튼 없음
  if (authMode === 'login') {
    return (
      <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-screen">
        <LoginPage />
      </div>
    );
  }

  // 서브페이지들 - 헤더와 뒤로가기 버튼 포함
  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-screen">
      <AuthHeader />
      
      <div className="flex flex-col px-5 w-full flex-1 overflow-hidden">
        {signup.step === 'role-selection' && <SignupRolePage />}
        {signup.step === 'personal-info' && <SignupPersonalPage />}
        {signup.step === 'account-info' && <SignupAccountPage />}
        {signup.step === 'terms' && <SignupTermsPage />}
      </div>
    </div>
  );
} 