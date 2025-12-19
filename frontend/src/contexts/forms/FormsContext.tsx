'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { contextEventBus } from '../events/ContextEventBus';

// 개별 폼 Manager들 import
import { EnrollmentFormManager, EnrollmentFormState, EnrollmentStep } from './EnrollmentFormManager';
import { EnrollmentModificationFormManager, EnrollmentModificationFormState, EnrollmentModificationStep } from './EnrollmentModificationFormManager';
import { AuthFormManager, AuthFormState, SignupStep } from './AuthFormManager';
import { PrincipalCreateClassFormManager, PrincipalCreateClassFormState, PrincipalCreateClassStep } from './PrincipalCreateClassFormManager';
import { SessionDetailFormManager, SessionDetailFormState } from './SessionDetailFormManager';

// 폼 상태 통합 타입
export interface FormsState {
  enrollment: EnrollmentFormState;
  enrollmentModification: EnrollmentModificationFormState;
  auth: AuthFormState;
  principalCreateClass: PrincipalCreateClassFormState;
  sessionDetail: SessionDetailFormState;
}

interface FormsContextType {
  // 상태
  forms: FormsState;
  
  // 개별 폼 상태 접근 (Helper)
  enrollment: EnrollmentFormState;
  enrollmentModification: EnrollmentModificationFormState;
  auth: AuthFormState;
  principalCreateClass: PrincipalCreateClassFormState;
  sessionDetail: SessionDetailFormState;
  
  // 폼 상태 업데이트 (Generic)
  updateForm: <T extends keyof FormsState>(
    formType: T,
    updates: Partial<FormsState[T]>
  ) => void;
  
  // --- Enrollment ---
  setEnrollmentStep: (step: EnrollmentStep) => void;
  setEnrollmentData: (data: Partial<EnrollmentFormState>) => void;
  resetEnrollment: () => void;
  
  // --- EnrollmentModification ---
  setEnrollmentModificationStep: (step: EnrollmentModificationStep) => void;
  setEnrollmentModificationData: (data: Partial<EnrollmentModificationFormState>) => void;
  resetEnrollmentModification: () => void;
  
  // --- Auth (Signup) ---
  setAuthStep: (step: SignupStep) => void;
  setAuthData: (data: Partial<AuthFormState>) => void;
  resetAuth: () => void;
  
  // --- PrincipalCreateClass ---
  setPrincipalCreateClassStep: (step: PrincipalCreateClassStep) => void;
  setPrincipalCreateClassData: (data: Partial<PrincipalCreateClassFormState>) => void;
  resetPrincipalCreateClass: () => void;

  // --- SessionDetail ---
  setSelectedSessionId: (sessionId: number | null) => void;
  setSelectedTab: (tab: 'content' | 'pose') => void;
  resetSessionDetail: () => void;

  // --- Global ---
  resetAllForms: () => void;
  getFormState: <T extends keyof FormsState>(formType: T) => FormsState[T];
}

const FormsContext = createContext<FormsContextType | undefined>(undefined);

export const useForms = (): FormsContextType => {
  const context = useContext(FormsContext);
  if (!context) {
    throw new Error('useForms must be used within an FormsProvider');
  }
  return context;
};

interface FormsProviderProps {
  children: ReactNode;
}

export const FormsProvider: React.FC<FormsProviderProps> = ({ children }) => {
  // 개별 폼 Manager들 초기화
  const [enrollmentManager] = useState(() => new EnrollmentFormManager(contextEventBus));
  const [enrollmentModificationManager] = useState(() => new EnrollmentModificationFormManager(contextEventBus));
  const [authManager] = useState(() => new AuthFormManager(contextEventBus));
  const [principalCreateClassManager] = useState(() => new PrincipalCreateClassFormManager(contextEventBus));
  const [sessionDetailManager] = useState(() => new SessionDetailFormManager(contextEventBus));
  
  // 폼 상태들
  const [enrollment, setEnrollment] = useState<EnrollmentFormState>(enrollmentManager.getState());
  const [enrollmentModification, setEnrollmentModification] = useState<EnrollmentModificationFormState>(enrollmentModificationManager.getState());
  const [auth, setAuth] = useState<AuthFormState>(authManager.getState());
  const [principalCreateClass, setPrincipalCreateClass] = useState<PrincipalCreateClassFormState>(principalCreateClassManager.getState());
  const [sessionDetail, setSessionDetail] = useState<SessionDetailFormState>(sessionDetailManager.getState());
  
  // 통합 폼 상태
  const forms: FormsState = useMemo(() => ({
    enrollment,
    enrollmentModification,
    auth,
    principalCreateClass,
    sessionDetail,
  }), [enrollment, enrollmentModification, auth, principalCreateClass, sessionDetail]);

  // Manager 상태 구독
  useEffect(() => {
    const unsubscribeEnrollment = enrollmentManager.subscribe(setEnrollment);
    const unsubscribeEnrollmentModification = enrollmentModificationManager.subscribe(setEnrollmentModification);
    const unsubscribeAuth = authManager.subscribe(setAuth);
    const unsubscribePrincipalCreateClass = principalCreateClassManager.subscribe(setPrincipalCreateClass);
    const unsubscribeSessionDetail = sessionDetailManager.subscribe(setSessionDetail);

    return () => {
      unsubscribeEnrollment();
      unsubscribeEnrollmentModification();
      unsubscribeAuth();
      unsubscribePrincipalCreateClass();
      unsubscribeSessionDetail();
    };
  }, [enrollmentManager, enrollmentModificationManager, authManager, principalCreateClassManager, sessionDetailManager]);


  // 📢 탭/네비게이션 변경 이벤트 구독 - 폼 초기화 정책 적용
  useEffect(() => {
    const unsubscribe = contextEventBus.subscribe('tabChanged', () => {
      // 탭 변경 시 모든 폼 초기화 (필요에 따라 정책 조정 가능)
      enrollmentManager.reset();
      enrollmentModificationManager.reset();
      authManager.reset();
      principalCreateClassManager.reset();
      sessionDetailManager.reset();
    });

    return unsubscribe;
  }, [enrollmentManager, enrollmentModificationManager, authManager, principalCreateClassManager, sessionDetailManager]);

  // 폼 상태 업데이트 (Placeholder)
  const updateForm = useCallback(<T extends keyof FormsState>(
    _formType: T,
    _updates: Partial<FormsState[T]>
  ) => {
    // 개별 Manager를 통해 상태가 업데이트되므로 여기서는 구현하지 않음
  }, []);

  // --- Enrollment Methods ---
  const setEnrollmentStep = useCallback((step: EnrollmentStep) => {
    enrollmentManager.setCurrentStep(step);
  }, [enrollmentManager]);

  const setEnrollmentData = useCallback((data: Partial<EnrollmentFormState>) => {
    if (data.currentStep) enrollmentManager.setCurrentStep(data.currentStep);
    if (data.selectedMonth !== undefined && data.selectedMonth !== null) enrollmentManager.setSelectedMonth(data.selectedMonth);
    if (data.selectedClasses) enrollmentManager.setSelectedClasses(data.selectedClasses);
    if (data.selectedSessions) enrollmentManager.setSelectedSessions(data.selectedSessions);
    if (data.selectedClassIds) enrollmentManager.setSelectedClassIds(data.selectedClassIds);
    if (data.selectedAcademyId !== undefined) enrollmentManager.setSelectedAcademyId(data.selectedAcademyId);
    if (data.selectedClassesWithSessions) enrollmentManager.setSelectedClassesWithSessions(data.selectedClassesWithSessions);
  }, [enrollmentManager]);

  const resetEnrollment = useCallback(() => {
    enrollmentManager.reset();
  }, [enrollmentManager]);

  // --- EnrollmentModification Methods ---
  const setEnrollmentModificationStep = useCallback((step: EnrollmentModificationStep) => {
    enrollmentModificationManager.setCurrentStep(step);
  }, [enrollmentModificationManager]);

  const setEnrollmentModificationData = useCallback((data: Partial<EnrollmentModificationFormState>) => {
    if (data.currentStep) enrollmentModificationManager.setCurrentStep(data.currentStep);
    if (data.modificationData !== undefined) enrollmentModificationManager.setModificationData(data.modificationData);
  }, [enrollmentModificationManager]);

  const resetEnrollmentModification = useCallback(() => {
    enrollmentModificationManager.reset();
  }, [enrollmentModificationManager]);

  // --- Auth Methods (Signup Only) ---
  const setAuthStep = useCallback((step: SignupStep) => {
    authManager.setSignupStep(step);
  }, [authManager]);

  const setAuthData = useCallback((data: Partial<AuthFormState>) => {
    // AuthFormState 구조 변경 반영: data.signup 내부 데이터만 처리
    if (data.signup) {
      const s = data.signup;
      if (s.step) authManager.setSignupStep(s.step);
      if (s.role) authManager.setRole(s.role);
      if (s.personalInfo) authManager.setPersonalInfo(s.personalInfo);
      if (s.accountInfo) authManager.setAccountInfo(s.accountInfo);
      if (s.academyInfo) authManager.setAcademyInfo(s.academyInfo);
      if (s.terms) authManager.setTerms(s.terms);
    }
  }, [authManager]);

  const resetAuth = useCallback(() => {
    authManager.reset();
  }, [authManager]);

  // --- PrincipalCreateClass Methods ---
  const setPrincipalCreateClassStep = useCallback((step: PrincipalCreateClassStep) => {
    principalCreateClassManager.setCurrentStep(step);
  }, [principalCreateClassManager]);

  const setPrincipalCreateClassData = useCallback((data: Partial<PrincipalCreateClassFormState>) => {
    if (data.currentStep) principalCreateClassManager.setCurrentStep(data.currentStep);
    if (data.classFormData) principalCreateClassManager.setClassFormData(data.classFormData);
    if (data.selectedTeacherId !== undefined) principalCreateClassManager.setSelectedTeacherId(data.selectedTeacherId);
  }, [principalCreateClassManager]);

  const resetPrincipalCreateClass = useCallback(() => {
    principalCreateClassManager.reset();
  }, [principalCreateClassManager]);

  // --- SessionDetail Methods ---
  const setSelectedSessionId = useCallback((sessionId: number | null) => {
    sessionDetailManager.setSelectedSessionId(sessionId);
  }, [sessionDetailManager]);

  const setSelectedTab = useCallback((tab: 'content' | 'pose') => {
    sessionDetailManager.setSelectedTab(tab);
  }, [sessionDetailManager]);

  const resetSessionDetail = useCallback(() => {
    sessionDetailManager.reset();
  }, [sessionDetailManager]);

  // --- Global Methods ---
  const resetAllForms = useCallback(() => {
    enrollmentManager.reset();
    enrollmentModificationManager.reset();
    authManager.reset();
    principalCreateClassManager.reset();
    sessionDetailManager.reset();
  }, [enrollmentManager, enrollmentModificationManager, authManager, principalCreateClassManager, sessionDetailManager]);

  const getFormState = useCallback(<T extends keyof FormsState>(formType: T): FormsState[T] => {
    return forms[formType];
  }, [forms]);

  const value: FormsContextType = {
    forms,
    enrollment,
    enrollmentModification,
    auth,
    principalCreateClass,
    sessionDetail,
    updateForm,
    // Enrollment
    setEnrollmentStep,
    setEnrollmentData,
    resetEnrollment,
    // Modification
    setEnrollmentModificationStep,
    setEnrollmentModificationData,
    resetEnrollmentModification,
    // Auth
    setAuthStep,
    setAuthData,
    resetAuth,
    // Principal
    setPrincipalCreateClassStep,
    setPrincipalCreateClassData,
    resetPrincipalCreateClass,
    // SessionDetail
    setSelectedSessionId,
    setSelectedTab,
    resetSessionDetail,
    // Global
    resetAllForms,
    getFormState,
  };

  return (
    <FormsContext.Provider value={value}>
      {children}
    </FormsContext.Provider>
  );
};