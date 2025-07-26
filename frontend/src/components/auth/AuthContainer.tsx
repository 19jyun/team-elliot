'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { LoginPage } from './pages/LoginPage';
import { SignupRolePage } from './pages/SignupRolePage';
import { SignupPersonalPage } from './pages/SignupPersonalPage';
import { SignupAccountPage } from './pages/SignupAccountPage';
import { SignupTermsPage } from './pages/SignupTermsPage';

export function AuthContainer() {
  const { authSubPage } = useAuth();

  // 기본 페이지 (로그인) - 뒤로가기 버튼 없음
  if (authSubPage === null) {
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
        {authSubPage === 'signup-role' && <SignupRolePage />}
        {authSubPage === 'signup-personal' && <SignupPersonalPage />}
        {authSubPage === 'signup-account' && <SignupAccountPage />}
        {authSubPage === 'signup-terms' && <SignupTermsPage />}
      </div>
    </div>
  );
} 