'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// 인증 모드 타입
export type AuthMode = 'login' | 'signup';

// 회원가입 단계 타입
export type SignupStep = 'role-selection' | 'personal-info' | 'account-info' | 'terms';

// 회원가입 상태 인터페이스
export interface SignupState {
  currentStep: SignupStep;
  role: 'STUDENT' | 'TEACHER' | null;
  personalInfo: {
    name: string;
    phoneNumber: string;
  };
  accountInfo: {
    userId: string;
    password: string;
    confirmPassword: string;
  };
  terms: {
    age: boolean;
    terms1: boolean;
    terms2: boolean;
    marketing: boolean;
  };
}

// 로그인 상태 인터페이스
export interface LoginState {
  userId: string;
  password: string;
}

interface AuthContextType {
  // 현재 인증 모드
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  
  // 회원가입 관련
  signup: SignupState;
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: 'STUDENT' | 'TEACHER') => void;
  setPersonalInfo: (info: { name: string; phoneNumber: string }) => void;
  setAccountInfo: (info: { userId: string; password: string; confirmPassword: string }) => void;
  setTerms: (terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => void;
  resetSignup: () => void;
  
  // 로그인 관련
  login: LoginState;
  setLoginInfo: (info: { userId: string; password: string }) => void;
  resetLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [signup, setSignup] = useState<SignupState>({
    currentStep: 'role-selection',
    role: null,
    personalInfo: { name: '', phoneNumber: '' },
    accountInfo: { userId: '', password: '', confirmPassword: '' },
    terms: { age: false, terms1: false, terms2: false, marketing: false },
  });
  const [login, setLogin] = useState<LoginState>({
    userId: '',
    password: '',
  });

  // 인증 모드 변경
  const handleSetAuthMode = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    // 모드 변경 시 상태 초기화
    if (mode === 'signup') {
      resetSignup();
    } else {
      resetLogin();
    }
  }, []);

  // 회원가입 관련 메서드들
  const setSignupStep = useCallback((step: SignupStep) => {
    setSignup(prev => ({ ...prev, currentStep: step }));
  }, []);

  const setRole = useCallback((role: 'STUDENT' | 'TEACHER') => {
    setSignup(prev => ({ ...prev, role }));
  }, []);

  const setPersonalInfo = useCallback((info: { name: string; phoneNumber: string }) => {
    setSignup(prev => ({ ...prev, personalInfo: info }));
  }, []);

  const setAccountInfo = useCallback((info: { userId: string; password: string; confirmPassword: string }) => {
    setSignup(prev => ({ ...prev, accountInfo: info }));
  }, []);

  const setTerms = useCallback((terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => {
    setSignup(prev => ({ ...prev, terms }));
  }, []);

  const resetSignup = useCallback(() => {
    setSignup({
      currentStep: 'role-selection',
      role: null,
      personalInfo: { name: '', phoneNumber: '' },
      accountInfo: { userId: '', password: '', confirmPassword: '' },
      terms: { age: false, terms1: false, terms2: false, marketing: false },
    });
  }, []);

  // 로그인 관련 메서드들
  const setLoginInfo = useCallback((info: { userId: string; password: string }) => {
    setLogin(info);
  }, []);

  const resetLogin = useCallback(() => {
    setLogin({ userId: '', password: '' });
  }, []);

  return (
    <AuthContext.Provider value={{
      authMode,
      setAuthMode: handleSetAuthMode,
      signup,
      setSignupStep,
      setRole,
      setPersonalInfo,
      setAccountInfo,
      setTerms,
      resetSignup,
      login,
      setLoginInfo,
      resetLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 