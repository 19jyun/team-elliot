// src/contexts/forms/AuthFormContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthFormManager, AuthFormState, SignupStep } from './AuthFormManager';
import { contextEventBus } from '../events/ContextEventBus';

interface AuthFormContextType {
  // 상태
  state: AuthFormState;
  
  // 편의 속성 (signup 데이터만 노출)
  signup: {
    step: SignupStep;
    role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | null;
    personalInfo: { name: string; phoneNumber: string };
    accountInfo: { userId: string; password: string; confirmPassword: string };
    terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean };
  };
  
  // [삭제됨] authMode, authSubPage, setAuthMode, setAuthSubPage
  
  // 회원가입 데이터 관리 (Setter)
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL') => void;
  setPersonalInfo: (info: { name: string; phoneNumber: string }) => void;
  setAccountInfo: (info: { userId: string; password: string; confirmPassword: string }) => void;
  setTerms: (terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => void;
  
  // [삭제됨] navigateToAuthSubPage, goBackFromAuth, clearAuthSubPage
  
  // 초기화
  resetSignup: () => void;
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

  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [manager]);

  // 메서드 래핑 (useCallback)
  const setSignupStep = useCallback((step: SignupStep) => manager.setSignupStep(step), [manager]);
  const setRole = useCallback((role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL') => manager.setRole(role), [manager]);
  const setPersonalInfo = useCallback((info: { name: string; phoneNumber: string }) => manager.setPersonalInfo(info), [manager]);
  const setAccountInfo = useCallback((info: { userId: string; password: string; confirmPassword: string }) => manager.setAccountInfo(info), [manager]);
  const setTerms = useCallback((terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => manager.setTerms(terms), [manager]);
  
  const resetSignup = useCallback(() => manager.resetSignup(), [manager]);
  const reset = useCallback(() => manager.reset(), [manager]);

  const value: AuthFormContextType = {
    state,
    signup: state.signup,
    setSignupStep,
    setRole,
    setPersonalInfo,
    setAccountInfo,
    setTerms,
    resetSignup,
    reset,
  };

  return (
    <AuthFormContext.Provider value={value}>
      {children}
    </AuthFormContext.Provider>
  );
};