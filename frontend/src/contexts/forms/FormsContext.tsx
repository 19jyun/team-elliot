// src/contexts/forms/FormsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode, useRef } from 'react';
import { useStateSync } from '../state/StateSyncContext';
import { FormsState } from '../state/StateSyncTypes';
import { contextEventBus } from '../events/ContextEventBus';

// 개별 폼 Manager들 import
import { EnrollmentFormManager, EnrollmentFormState, EnrollmentStep, EnrollmentModificationData } from './EnrollmentFormManager';
import { EnrollmentModificationFormManager, EnrollmentModificationFormState, EnrollmentModificationStep } from './EnrollmentModificationFormManager';
import { CreateClassFormManager, CreateClassFormState, CreateClassStep } from './CreateClassFormManager';
import { AuthFormManager, AuthFormState, AuthMode, SignupStep } from './AuthFormManager';
import { PersonManagementFormManager, PersonManagementFormState, PrincipalPersonManagementStep } from './PersonManagementFormManager';
import { PrincipalCreateClassFormManager, PrincipalCreateClassFormState, PrincipalCreateClassStep } from './PrincipalCreateClassFormManager';
import { PrincipalPersonManagementFormManager, PrincipalPersonManagementFormState } from './PrincipalPersonManagementFormManager';

interface FormsContextType {
  // 상태
  forms: FormsState;
  
  // 개별 폼 상태 접근
  enrollment: EnrollmentFormState;
  enrollmentModification: EnrollmentModificationFormState;
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
  setModificationData: (data: EnrollmentModificationData | null) => void;
  resetEnrollment: () => void;
  
  // EnrollmentModification
  setEnrollmentModificationStep: (step: EnrollmentModificationStep) => void;
  setEnrollmentModificationData: (data: Partial<EnrollmentModificationFormState>) => void;
  resetEnrollmentModification: () => void;
  
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
  switchPrincipalPersonManagementTab: (tab: 'enrollment' | 'refund') => void;
  
  // 전체 폼 관리
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
  const stateSync = useStateSync();
  
  // 개별 폼 Manager들 초기화
  const [enrollmentManager] = useState(() => new EnrollmentFormManager(contextEventBus));
  const [enrollmentModificationManager] = useState(() => new EnrollmentModificationFormManager(contextEventBus));
  const [createClassManager] = useState(() => new CreateClassFormManager(contextEventBus));
  const [authManager] = useState(() => new AuthFormManager(contextEventBus));
  const [personManagementManager] = useState(() => new PersonManagementFormManager(contextEventBus));
  const [principalCreateClassManager] = useState(() => new PrincipalCreateClassFormManager(contextEventBus));
  const [principalPersonManagementManager] = useState(() => new PrincipalPersonManagementFormManager(contextEventBus));
  
  // 폼 상태들
  const [enrollment, setEnrollment] = useState<EnrollmentFormState>(enrollmentManager.getState());
  const [enrollmentModification, setEnrollmentModification] = useState<EnrollmentModificationFormState>(enrollmentModificationManager.getState());
  const [createClass, setCreateClass] = useState<CreateClassFormState>(createClassManager.getState());
  const [auth, setAuth] = useState<AuthFormState>(authManager.getState());
  const [personManagement, setPersonManagement] = useState<PersonManagementFormState>(personManagementManager.getState());
  const [principalCreateClass, setPrincipalCreateClass] = useState<PrincipalCreateClassFormState>(principalCreateClassManager.getState());
  const [principalPersonManagement, setPrincipalPersonManagement] = useState<PrincipalPersonManagementFormState>(principalPersonManagementManager.getState());
  
  // 통합 폼 상태
  const forms: FormsState = useMemo(() => ({
    enrollment,
    enrollmentModification,
    createClass,
    auth,
    personManagement,
    principalCreateClass,
    principalPersonManagement,
  }), [enrollment, enrollmentModification, createClass, auth, personManagement, principalCreateClass, principalPersonManagement]);

  // Manager 상태 구독
  useEffect(() => {
    const unsubscribeEnrollment = enrollmentManager.subscribe((newState) => {
      setEnrollment(newState);
      stateSync.publish('forms', { ...forms, enrollment: newState });
    });
    
    const unsubscribeEnrollmentModification = enrollmentModificationManager.subscribe((newState) => {
      setEnrollmentModification(newState);
      stateSync.publish('forms', { ...forms, enrollmentModification: newState });
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
      unsubscribeEnrollmentModification();
      unsubscribeCreateClass();
      unsubscribeAuth();
      unsubscribePersonManagement();
      unsubscribePrincipalCreateClass();
      unsubscribePrincipalPersonManagement();
    };
  }, [enrollmentManager, enrollmentModificationManager, createClassManager, authManager, personManagementManager, principalCreateClassManager, principalPersonManagementManager, stateSync, forms]);

  // StateSync에서 폼 상태 구독
  useEffect(() => {
    const unsubscribe = stateSync.subscribe('forms', (newFormsState: FormsState) => {
      if (newFormsState.enrollment) setEnrollment(newFormsState.enrollment);
      if (newFormsState.enrollmentModification) setEnrollmentModification(newFormsState.enrollmentModification);
      if (newFormsState.createClass) setCreateClass(newFormsState.createClass);
      if (newFormsState.auth) setAuth(newFormsState.auth);
      if (newFormsState.personManagement) setPersonManagement(newFormsState.personManagement);
      if (newFormsState.principalCreateClass) setPrincipalCreateClass(newFormsState.principalCreateClass);
      if (newFormsState.principalPersonManagement) setPrincipalPersonManagement(newFormsState.principalPersonManagement);
    });

    return unsubscribe;
  }, [stateSync]);

  // stateSync를 ref로 저장하여 최신 참조 유지
  const stateSyncRef = useRef(stateSync);
  stateSyncRef.current = stateSync;

  // 초기 폼 상태를 StateSync에 발행
  useEffect(() => {
    const formsState: FormsState = {
      enrollment,
      enrollmentModification,
      createClass,
      auth,
      personManagement,
      principalCreateClass,
      principalPersonManagement,
    };
    
    stateSyncRef.current.publish('forms', formsState);
  }, [enrollment, enrollmentModification, createClass, auth, personManagement, principalCreateClass, principalPersonManagement]);

  // 📢 탭 변경 이벤트 구독 - 모든 폼 초기화
  useEffect(() => {
    const unsubscribe = contextEventBus.subscribe('tabChanged', () => {
      // 탭이 변경되면 모든 폼 상태를 초기화
      enrollmentManager.reset();
      enrollmentModificationManager.reset();
      createClassManager.reset();
      authManager.reset();
      personManagementManager.reset();
      principalCreateClassManager.reset();
      principalPersonManagementManager.reset();
    });

    return unsubscribe;
  }, [enrollmentManager, enrollmentModificationManager, createClassManager, authManager, personManagementManager, principalCreateClassManager, principalPersonManagementManager]);

  // 폼 상태 업데이트
  const updateForm = useCallback(<T extends keyof FormsState>(
    formType: T,
    updates: Partial<FormsState[T]>
  ) => {
    const currentForms = { ...forms };
    currentForms[formType] = { ...currentForms[formType], ...updates };
    stateSyncRef.current.publish('forms', currentForms);
  }, [forms]);

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
    if (data.modificationData !== undefined) enrollmentManager.setModificationData(data.modificationData);
  }, [enrollmentManager]);

  const setModificationData = useCallback((data: EnrollmentModificationData | null) => {
    enrollmentManager.setModificationData(data);
  }, [enrollmentManager]);

  const resetEnrollment = useCallback(() => {
    enrollmentManager.reset();
  }, [enrollmentManager]);

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

  const switchPrincipalPersonManagementTab = useCallback((tab: 'enrollment' | 'refund') => {
    principalPersonManagementManager.switchTab(tab);
  }, [principalPersonManagementManager]);

  const resetAllForms = useCallback(() => {
    enrollmentManager.reset();
    enrollmentModificationManager.reset();
    createClassManager.reset();
    authManager.reset();
    personManagementManager.reset();
    principalCreateClassManager.reset();
    principalPersonManagementManager.reset();
  }, [enrollmentManager, enrollmentModificationManager, createClassManager, authManager, personManagementManager, principalCreateClassManager, principalPersonManagementManager]);

  const getFormState = useCallback(<T extends keyof FormsState>(formType: T): FormsState[T] => {
    return forms[formType];
  }, [forms]);

  const value: FormsContextType = {
    forms,
    enrollment,
    enrollmentModification,
    createClass,
    auth,
    personManagement,
    principalCreateClass,
    principalPersonManagement,
    updateForm,
    setEnrollmentStep,
    setEnrollmentData,
    setModificationData,
    resetEnrollment,
    setEnrollmentModificationStep,
    setEnrollmentModificationData,
    resetEnrollmentModification,
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
    switchPrincipalPersonManagementTab,
    resetAllForms,
    getFormState,
  };

  return (
    <FormsContext.Provider value={value}>
      {children}
    </FormsContext.Provider>
  );
};
