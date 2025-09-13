// src/contexts/forms/ImprovedFormsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useStateSync } from '../state/StateSyncContext';
import { FormsState } from '../state/StateSyncTypes';
import { contextEventBus } from '../events/ContextEventBus';

// 개별 폼 Manager들 import
import { EnrollmentFormManager, EnrollmentFormState, EnrollmentStep } from './EnrollmentFormManager';
import { CreateClassFormManager, CreateClassFormState, CreateClassStep } from './CreateClassFormManager';
import { AuthFormManager, AuthFormState, AuthMode, SignupStep } from './AuthFormManager';
import { PersonManagementFormManager, PersonManagementFormState, PrincipalPersonManagementStep } from './PersonManagementFormManager';
import { PrincipalCreateClassFormManager, PrincipalCreateClassFormState, PrincipalCreateClassStep } from './PrincipalCreateClassFormManager';
import { PrincipalPersonManagementFormManager, PrincipalPersonManagementFormState } from './PrincipalPersonManagementFormManager';

interface ImprovedFormsContextType {
  // 상태
  forms: FormsState;
  
  // 개별 폼 상태 접근
  enrollment: EnrollmentFormState;
  createClass: CreateClassFormState;
  auth: AuthFormState;
  personManagement: PersonManagementFormState;
  principalCreateClass: PrincipalCreateClassFormState;
  principalPersonManagement: PrincipalPersonManagementFormState;
  
  // 폼 상태 업데이트
  updateForm: <T extends keyof FormsState>(
    formType: T,
    updates: Partial<FormsState[T]>
  ) => void;
  
  // 개별 폼 메서드들
  // Enrollment
  setEnrollmentStep: (step: EnrollmentStep) => void;
  setEnrollmentData: (data: Partial<EnrollmentFormState>) => void;
  resetEnrollment: () => void;
  
  // CreateClass
  setCreateClassStep: (step: CreateClassStep) => void;
  setCreateClassData: (data: Partial<CreateClassFormState>) => void;
  resetCreateClass: () => void;
  
  // Auth
  setAuthMode: (mode: AuthMode) => void;
  setAuthStep: (step: SignupStep) => void;
  setAuthData: (data: Partial<AuthFormState>) => void;
  resetAuth: () => void;
  
  // PersonManagement
  setPersonManagementStep: (step: PrincipalPersonManagementStep) => void;
  setPersonManagementData: (data: Partial<PersonManagementFormState>) => void;
  resetPersonManagement: () => void;
  
  // PrincipalCreateClass
  setPrincipalCreateClassStep: (step: PrincipalCreateClassStep) => void;
  setPrincipalCreateClassData: (data: Partial<PrincipalCreateClassFormState>) => void;
  resetPrincipalCreateClass: () => void;
  
  // PrincipalPersonManagement
  setPrincipalPersonManagementStep: (step: PrincipalPersonManagementStep) => void;
  setPrincipalPersonManagementData: (data: Partial<PrincipalPersonManagementFormState>) => void;
  resetPrincipalPersonManagement: () => void;
  
  // 전체 폼 관리
  resetAllForms: () => void;
  getFormState: <T extends keyof FormsState>(formType: T) => FormsState[T];
}

const ImprovedFormsContext = createContext<ImprovedFormsContextType | undefined>(undefined);

export const useImprovedForms = (): ImprovedFormsContextType => {
  const context = useContext(ImprovedFormsContext);
  if (!context) {
    throw new Error('useImprovedForms must be used within an ImprovedFormsProvider');
  }
  return context;
};

interface ImprovedFormsProviderProps {
  children: ReactNode;
}

export const ImprovedFormsProvider: React.FC<ImprovedFormsProviderProps> = ({ children }) => {
  const stateSync = useStateSync();
  
  // 개별 폼 Manager들 초기화
  const [enrollmentManager] = useState(() => new EnrollmentFormManager(contextEventBus));
  const [createClassManager] = useState(() => new CreateClassFormManager(contextEventBus));
  const [authManager] = useState(() => new AuthFormManager(contextEventBus));
  const [personManagementManager] = useState(() => new PersonManagementFormManager(contextEventBus));
  const [principalCreateClassManager] = useState(() => new PrincipalCreateClassFormManager(contextEventBus));
  const [principalPersonManagementManager] = useState(() => new PrincipalPersonManagementFormManager(contextEventBus));
  
  // 폼 상태들
  const [enrollment, setEnrollment] = useState<EnrollmentFormState>(enrollmentManager.getState());
  const [createClass, setCreateClass] = useState<CreateClassFormState>(createClassManager.getState());
  const [auth, setAuth] = useState<AuthFormState>(authManager.getState());
  const [personManagement, setPersonManagement] = useState<PersonManagementFormState>(personManagementManager.getState());
  const [principalCreateClass, setPrincipalCreateClass] = useState<PrincipalCreateClassFormState>(principalCreateClassManager.getState());
  const [principalPersonManagement, setPrincipalPersonManagement] = useState<PrincipalPersonManagementFormState>(principalPersonManagementManager.getState());
  
  // 통합 폼 상태
  const forms: FormsState = {
    enrollment,
    createClass,
    auth,
    personManagement,
    principalCreateClass,
    principalPersonManagement,
  };

  // Manager 상태 구독
  useEffect(() => {
    const unsubscribeEnrollment = enrollmentManager.subscribe((newState) => {
      setEnrollment(newState);
      stateSync.publish('forms', { ...forms, enrollment: newState });
    });
    
    const unsubscribeCreateClass = createClassManager.subscribe((newState) => {
      setCreateClass(newState);
      stateSync.publish('forms', { ...forms, createClass: newState });
    });
    
    const unsubscribeAuth = authManager.subscribe((newState) => {
      setAuth(newState);
      stateSync.publish('forms', { ...forms, auth: newState });
    });
    
    const unsubscribePersonManagement = personManagementManager.subscribe((newState) => {
      setPersonManagement(newState);
      stateSync.publish('forms', { ...forms, personManagement: newState });
    });
    
    const unsubscribePrincipalCreateClass = principalCreateClassManager.subscribe((newState) => {
      setPrincipalCreateClass(newState);
      stateSync.publish('forms', { ...forms, principalCreateClass: newState });
    });
    
    const unsubscribePrincipalPersonManagement = principalPersonManagementManager.subscribe((newState) => {
      setPrincipalPersonManagement(newState);
      stateSync.publish('forms', { ...forms, principalPersonManagement: newState });
    });

    return () => {
      unsubscribeEnrollment();
      unsubscribeCreateClass();
      unsubscribeAuth();
      unsubscribePersonManagement();
      unsubscribePrincipalCreateClass();
      unsubscribePrincipalPersonManagement();
    };
  }, [enrollmentManager, createClassManager, authManager, personManagementManager, principalCreateClassManager, principalPersonManagementManager, stateSync, forms]);

  // StateSync에서 폼 상태 구독
  useEffect(() => {
    const unsubscribe = stateSync.subscribe('forms', (newFormsState: FormsState) => {
      if (newFormsState.enrollment) setEnrollment(newFormsState.enrollment);
      if (newFormsState.createClass) setCreateClass(newFormsState.createClass);
      if (newFormsState.auth) setAuth(newFormsState.auth);
      if (newFormsState.personManagement) setPersonManagement(newFormsState.personManagement);
      if (newFormsState.principalCreateClass) setPrincipalCreateClass(newFormsState.principalCreateClass);
      if (newFormsState.principalPersonManagement) setPrincipalPersonManagement(newFormsState.principalPersonManagement);
    });

    return unsubscribe;
  }, [stateSync]);

  // 초기 폼 상태를 StateSync에 발행
  useEffect(() => {
    const formsState: FormsState = {
      enrollment,
      createClass,
      auth,
      personManagement,
      principalCreateClass,
      principalPersonManagement,
    };
    
    stateSync.publish('forms', formsState);
  }, [enrollment, createClass, auth, personManagement, principalCreateClass, principalPersonManagement]);

  // 폼 상태 업데이트
  const updateForm = useCallback(<T extends keyof FormsState>(
    formType: T,
    updates: Partial<FormsState[T]>
  ) => {
    const currentForms = { ...forms };
    currentForms[formType] = { ...currentForms[formType], ...updates };
    stateSync.publish('forms', currentForms);
  }, [forms, stateSync]);

  // 개별 폼 메서드들
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

  const setCreateClassStep = useCallback((step: CreateClassStep) => {
    createClassManager.setCurrentStep(step);
  }, [createClassManager]);

  const setCreateClassData = useCallback((data: Partial<CreateClassFormState>) => {
    if (data.currentStep) createClassManager.setCurrentStep(data.currentStep);
    if (data.classFormData) createClassManager.setClassFormData(data.classFormData);
    if (data.selectedTeacherId !== undefined) createClassManager.setSelectedTeacherId(data.selectedTeacherId);
  }, [createClassManager]);

  const resetCreateClass = useCallback(() => {
    createClassManager.reset();
  }, [createClassManager]);

  const setAuthMode = useCallback((mode: AuthMode) => {
    authManager.setAuthMode(mode);
  }, [authManager]);

  const setAuthStep = useCallback((step: SignupStep) => {
    authManager.setSignupStep(step);
  }, [authManager]);

  const setAuthData = useCallback((data: Partial<AuthFormState>) => {
    if (data.authMode) authManager.setAuthMode(data.authMode);
    if (data.authSubPage !== undefined) authManager.setAuthSubPage(data.authSubPage);
    if (data.signup) {
      if (data.signup.step) authManager.setSignupStep(data.signup.step);
      if (data.signup.role) authManager.setRole(data.signup.role);
      if (data.signup.personalInfo) authManager.setPersonalInfo(data.signup.personalInfo);
      if (data.signup.accountInfo) authManager.setAccountInfo(data.signup.accountInfo);
      if (data.signup.terms) authManager.setTerms(data.signup.terms);
    }
    if (data.login) authManager.setLoginInfo(data.login);
  }, [authManager]);

  const resetAuth = useCallback(() => {
    authManager.reset();
  }, [authManager]);

  const setPersonManagementStep = useCallback((step: PrincipalPersonManagementStep) => {
    personManagementManager.setCurrentStep(step);
  }, [personManagementManager]);

  const setPersonManagementData = useCallback((data: Partial<PersonManagementFormState>) => {
    if (data.currentStep) personManagementManager.setCurrentStep(data.currentStep);
    if (data.selectedTab) personManagementManager.setSelectedTab(data.selectedTab);
    if (data.selectedClassId !== undefined) personManagementManager.setSelectedClassId(data.selectedClassId);
    if (data.selectedSessionId !== undefined) personManagementManager.setSelectedSessionId(data.selectedSessionId);
    if (data.selectedRequestId !== undefined) personManagementManager.setSelectedRequestId(data.selectedRequestId);
    if (data.selectedRequestType !== undefined) personManagementManager.setSelectedRequestType(data.selectedRequestType);
  }, [personManagementManager]);

  const resetPersonManagement = useCallback(() => {
    personManagementManager.reset();
  }, [personManagementManager]);

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

  const setPrincipalPersonManagementStep = useCallback((step: PrincipalPersonManagementStep) => {
    principalPersonManagementManager.setCurrentStep(step);
  }, [principalPersonManagementManager]);

  const setPrincipalPersonManagementData = useCallback((data: Partial<PrincipalPersonManagementFormState>) => {
    if (data.currentStep) principalPersonManagementManager.setCurrentStep(data.currentStep);
    if (data.selectedTab) principalPersonManagementManager.setSelectedTab(data.selectedTab);
    if (data.selectedClassId !== undefined) principalPersonManagementManager.setSelectedClassId(data.selectedClassId);
    if (data.selectedSessionId !== undefined) principalPersonManagementManager.setSelectedSessionId(data.selectedSessionId);
    if (data.selectedRequestId !== undefined) principalPersonManagementManager.setSelectedRequestId(data.selectedRequestId);
    if (data.selectedRequestType !== undefined) principalPersonManagementManager.setSelectedRequestType(data.selectedRequestType);
  }, [principalPersonManagementManager]);

  const resetPrincipalPersonManagement = useCallback(() => {
    principalPersonManagementManager.reset();
  }, [principalPersonManagementManager]);

  const resetAllForms = useCallback(() => {
    enrollmentManager.reset();
    createClassManager.reset();
    authManager.reset();
    personManagementManager.reset();
    principalCreateClassManager.reset();
    principalPersonManagementManager.reset();
  }, [enrollmentManager, createClassManager, authManager, personManagementManager, principalCreateClassManager, principalPersonManagementManager]);

  const getFormState = useCallback(<T extends keyof FormsState>(formType: T): FormsState[T] => {
    return forms[formType];
  }, [forms]);

  const value: ImprovedFormsContextType = {
    forms,
    enrollment,
    createClass,
    auth,
    personManagement,
    principalCreateClass,
    principalPersonManagement,
    updateForm,
    setEnrollmentStep,
    setEnrollmentData,
    resetEnrollment,
    setCreateClassStep,
    setCreateClassData,
    resetCreateClass,
    setAuthMode,
    setAuthStep,
    setAuthData,
    resetAuth,
    setPersonManagementStep,
    setPersonManagementData,
    resetPersonManagement,
    setPrincipalCreateClassStep,
    setPrincipalCreateClassData,
    resetPrincipalCreateClass,
    setPrincipalPersonManagementStep,
    setPrincipalPersonManagementData,
    resetPrincipalPersonManagement,
    resetAllForms,
    getFormState,
  };

  return (
    <ImprovedFormsContext.Provider value={value}>
      {children}
    </ImprovedFormsContext.Provider>
  );
};
