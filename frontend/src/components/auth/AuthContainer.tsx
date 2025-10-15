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
  const { form, navigation } = useApp();
  const { authMode } = form.auth;
  const { subPage } = navigation;

  // SubPage 렌더링 함수 (Dashboard 방식)
  const renderSubPage = () => {
    if (!subPage) return null;
    
    switch (subPage) {
      case 'signup-roles':
        return <SignupRolePage />;
      case 'signup-personal':
        return <SignupPersonalPage />;
      case 'signup-account':
        return <SignupAccountPage />;
      case 'signup-academy':
        return <SignupAcademyPage />;
      case 'signup-terms':
        return <SignupTermsPage />;
      default:
        return null;
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-screen">
        {authMode === 'login' ? (
          <LoginPage />
        ) : (
          <>
            <AuthHeader />
            <div className="flex flex-col px-5 w-full flex-1 overflow-hidden">
              {renderSubPage()}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
} 