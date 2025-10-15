'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { LoginPage } from './pages/LoginPage';
import { SignupRolePage } from './pages/SignupRolePage';
import { SignupPersonalPage } from './pages/SignupPersonalPage';
import { SignupAccountPage } from './pages/SignupAccountPage';
import { SignupAcademyPage } from './pages/SignupAcademyPage';
import { SignupTermsPage } from './pages/SignupTermsPage';

export function AuthContainer() {
  const { form } = useApp();
  const { authMode, signup } = form.auth;

  return (
    <AuthGuard requireAuth={false}>
      <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-screen">
        {authMode === 'login' ? (
          <LoginPage />
        ) : (
          <>
            <AuthHeader />
            <div className="flex flex-col px-5 w-full flex-1 overflow-hidden">
              {signup.step === 'role-selection' && <SignupRolePage />}
              {signup.step === 'personal-info' && <SignupPersonalPage />}
              {signup.step === 'account-info' && <SignupAccountPage />}
              {signup.step === 'academy-info' && <SignupAcademyPage />}
              {signup.step === 'terms' && <SignupTermsPage />}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
} 