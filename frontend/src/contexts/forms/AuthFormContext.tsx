// src/contexts/forms/AuthFormContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthFormManager, AuthFormState, AuthMode, SignupStep } from './AuthFormManager';
import { contextEventBus } from '../events/ContextEventBus';

interface AuthFormContextType {
  // 상태
  state: AuthFormState;
  
  // 모드 관리
  setAuthMode: (mode: AuthMode) => void;
  setAuthSubPage: (page: string | null) => void;
  
  // 회원가입 관리
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: 'STUDENT' | 'TEACHER') => void;
  setPersonalInfo: (info: { name: string; phoneNumber: string }) => void;
  setAccountInfo: (info: { userId: string; password: string; confirmPassword: string }) => void;
  setTerms: (terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => void;
  
  // 로그인 관리
  setLoginInfo: (info: { userId: string; password: string }) => void;
  
  // 초기화
  reset: () => void;
}

const AuthFormContext = createContext<AuthFormContextType | undefined>(undefined);

export const useAuthForm = (): AuthFormContextType => {
  const context = useContext(AuthFormContext);
  if (!context) {
    throw new Error('useAuthForm must be used within an AuthFormProvider');
  }
  return context;
};

interface AuthFormProviderProps {
  children: React.ReactNode;
}

export const AuthFormProvider: React.FC<AuthFormProviderProps> = ({ children }) => {
  const [manager] = useState(() => new AuthFormManager(contextEventBus));
  const [state, setState] = useState<AuthFormState>(manager.getState());

  // Manager 상태 구독
  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [manager]);

  // 이벤트 버스 구독
  useEffect(() => {
    const unsubscribe = contextEventBus.subscribe('navigationChanged', (data) => {
      // 네비게이션 변경 시 폼 상태 초기화 (필요한 경우)
      if (data.subPage !== 'auth') {
        manager.reset();
      }
    });

    return unsubscribe;
  }, [manager]);

  // Context 메서드들
  const setAuthMode = useCallback((mode: AuthMode) => {
    manager.setAuthMode(mode);
  }, [manager]);

  const setAuthSubPage = useCallback((page: string | null) => {
    manager.setAuthSubPage(page);
  }, [manager]);

  const setSignupStep = useCallback((step: SignupStep) => {
    manager.setSignupStep(step);
  }, [manager]);

  const setRole = useCallback((role: 'STUDENT' | 'TEACHER') => {
    manager.setRole(role);
  }, [manager]);

  const setPersonalInfo = useCallback((info: { name: string; phoneNumber: string }) => {
    manager.setPersonalInfo(info);
  }, [manager]);

  const setAccountInfo = useCallback((info: { userId: string; password: string; confirmPassword: string }) => {
    manager.setAccountInfo(info);
  }, [manager]);

  const setTerms = useCallback((terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => {
    manager.setTerms(terms);
  }, [manager]);

  const setLoginInfo = useCallback((info: { userId: string; password: string }) => {
    manager.setLoginInfo(info);
  }, [manager]);

  const reset = useCallback(() => {
    manager.reset();
  }, [manager]);

  const value: AuthFormContextType = {
    state,
    setAuthMode,
    setAuthSubPage,
    setSignupStep,
    setRole,
    setPersonalInfo,
    setAccountInfo,
    setTerms,
    setLoginInfo,
    reset,
  };

  return (
    <AuthFormContext.Provider value={value}>
      {children}
    </AuthFormContext.Provider>
  );
};
