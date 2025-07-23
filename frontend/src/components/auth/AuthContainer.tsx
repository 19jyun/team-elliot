'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupContainer } from './SignupContainer';

export function AuthContainer() {
  const { authMode } = useAuth();

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5 relative">
      {authMode === 'login' ? <LoginForm /> : <SignupContainer />}
    </div>
  );
} 