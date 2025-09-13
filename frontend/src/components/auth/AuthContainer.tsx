'use client';

import React from 'react';
import { useImprovedApp } from '@/contexts/ImprovedAppContext';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { LoginPage } from './pages/LoginPage';
import { SignupRolePage } from './pages/SignupRolePage';
import { SignupPersonalPage } from './pages/SignupPersonalPage';
import { SignupAccountPage } from './pages/SignupAccountPage';
import { SignupTermsPage } from './pages/SignupTermsPage';

export function AuthContainer() {
  const { form } = useImprovedApp();
  const { authMode, signup } = form.auth;

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