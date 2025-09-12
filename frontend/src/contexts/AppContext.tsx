// src/contexts/AppContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';

// Navigation Context
import { NavigationProvider, useNavigation, NavigationItem, NavigationHistoryItem } from './NavigationContext';

// Form Contexts
import {
  EnrollmentFormProvider,
  useEnrollmentForm,
  CreateClassFormProvider,
  useCreateClassForm,
  AuthFormProvider,
  useAuthForm,
  PersonManagementFormProvider,
  usePersonManagementForm,
  PrincipalCreateClassFormProvider,
  usePrincipalCreateClassForm,
  PrincipalPersonManagementFormProvider,
  usePrincipalPersonManagementForm,
} from './forms';

// UI Context
import { UIContextProvider, useUI } from './UIContext';

// Data Context
import { DataContextProvider, useData } from './DataContext';

// Event Bus
import { contextEventBus } from './events/ContextEventBus';

// 통합된 AppContext 타입
interface AppContextType {
  // Navigation
  activeTab: number;
  subPage: string | null;
  canGoBack: boolean;
  isTransitioning: boolean;
  navigationItems: NavigationItem[];
  history: NavigationHistoryItem[];
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  navigateToSubPage: (page: string) => void;
  clearSubPage: () => void;
  goBack: () => Promise<boolean>;

  // Forms
  forms: {
    enrollment: ReturnType<typeof useEnrollmentForm>;
    createClass: ReturnType<typeof useCreateClassForm>;
    auth: ReturnType<typeof useAuthForm>;
    personManagement: ReturnType<typeof usePersonManagementForm>;
    principalCreateClass: ReturnType<typeof usePrincipalCreateClassForm>;
    principalPersonManagement: ReturnType<typeof usePrincipalPersonManagementForm>;
  };

  // UI
  ui: ReturnType<typeof useUI>;

  // Data
  data: ReturnType<typeof useData>;

  // Session
  session: ReturnType<typeof useSession>;

  // 통합된 goBack (하위 호환성)
  goBackLegacy: () => Promise<boolean>;
  
  // 고급 goBack 시스템 (새로운 설계)
  goBackAdvanced: () => Promise<boolean>;
  
  // 통합 폼 관리 (Legacy 호환)
  updateForm: <T extends keyof any>(
    formType: T,
    updates: Partial<any>
  ) => void;
  resetAllForms: () => void;
  getFormState: (formType: string) => any;

  // 하위 호환성을 위한 직접 접근 (Legacy API)
  navigation: ReturnType<typeof useNavigation>;
  form: {
    enrollment: ReturnType<typeof useEnrollmentForm>;
    createClass: ReturnType<typeof useCreateClassForm>;
    principalCreateClass: ReturnType<typeof usePrincipalCreateClassForm>;
    auth: ReturnType<typeof useAuthForm>;
    personManagement: ReturnType<typeof usePersonManagementForm>;
    principalPersonManagement: ReturnType<typeof usePrincipalPersonManagementForm>;
  };

  // 하위 호환성을 위한 직접 메서드들
  // 수강신청 관련
  setEnrollmentStep: (step: any) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedClasses: (classes: any[]) => void;
  setSelectedSessions: (sessions: any[]) => void;
  setSelectedClassIds: (classIds: number[]) => void;
  setSelectedAcademyId: (academyId: number | null) => void;
  setSelectedClassesWithSessions: (classes: any[]) => void;
  resetEnrollment: () => void;

  // 클래스 생성 관련
  setCreateClassStep: (step: any) => void;
  setClassFormData: (data: any) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;
  resetCreateClass: () => void;

  // Principal 클래스 생성 관련
  setPrincipalCreateClassStep: (step: any) => void;
  setPrincipalClassFormData: (data: any) => void;
  setPrincipalSelectedTeacherId: (teacherId: number | null) => void;
  resetPrincipalCreateClass: () => void;

  // 인증 관련
  setAuthMode: (mode: any) => void;
  setAuthSubPage: (page: string | null) => void;
  navigateToAuthSubPage: (page: string) => void;
  goBackFromAuth: () => void;
  clearAuthSubPage: () => void;
  setSignupStep: (step: any) => void;
  setRole: (role: 'STUDENT' | 'TEACHER') => void;
  setPersonalInfo: (info: any) => void;
  setAccountInfo: (info: any) => void;
  setTerms: (terms: any) => void;
  resetSignup: () => void;
  setLoginInfo: (info: any) => void;
  resetLogin: () => void;

  // 인원 관리 관련
  setPersonManagementStep: (step: any) => void;
  setPersonManagementTab: (tab: 'enrollment' | 'refund') => void;
  setSelectedClassId: (classId: number | null) => void;
  setSelectedSessionId: (sessionId: number | null) => void;
  setSelectedRequestId: (requestId: number | null) => void;
  setSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => void;
  resetPersonManagement: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 내부 컴포넌트들
const NavigationConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  return <>{children}</>;
};

const FormsConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const enrollment = useEnrollmentForm();
  const createClass = useCreateClassForm();
  const auth = useAuthForm();
  const personManagement = usePersonManagementForm();
  const principalCreateClass = usePrincipalCreateClassForm();
  const principalPersonManagement = usePrincipalPersonManagementForm();
  const ui = useUI();
  const data = useData();
  const session = useSession();

  // 고급 goBack 시스템 (새로운 설계)
  const goBackAdvanced = useCallback(async (): Promise<boolean> => {
    // NavigationContext의 고급 goBack 시스템 사용
    return await navigation.goBack();
  }, [navigation]);

  // 통합 폼 관리 메서드들 (Legacy 호환)
  const updateForm = useCallback(<T extends keyof any>(
    formType: T,
    updates: Partial<any>
  ) => {
    switch (formType) {
      case 'enrollment':
        // enrollment 폼 업데이트는 개별 메서드들을 통해 처리
        if (updates.currentStep) enrollment.setCurrentStep(updates.currentStep);
        if (updates.selectedMonth !== undefined) enrollment.setSelectedMonth(updates.selectedMonth);
        if (updates.selectedClasses) enrollment.setSelectedClasses(updates.selectedClasses);
        if (updates.selectedSessions) enrollment.setSelectedSessions(updates.selectedSessions);
        if (updates.selectedClassIds) enrollment.setSelectedClassIds(updates.selectedClassIds);
        if (updates.selectedAcademyId !== undefined) enrollment.setSelectedAcademyId(updates.selectedAcademyId);
        if (updates.selectedClassesWithSessions) enrollment.setSelectedClassesWithSessions(updates.selectedClassesWithSessions);
        break;
      case 'createClass':
        if (updates.currentStep) createClass.setCurrentStep(updates.currentStep);
        if (updates.classFormData) createClass.setClassFormData(updates.classFormData);
        if (updates.selectedTeacherId !== undefined) createClass.setSelectedTeacherId(updates.selectedTeacherId);
        break;
      case 'auth':
        if (updates.authMode) auth.setAuthMode(updates.authMode);
        if (updates.authSubPage !== undefined) auth.setAuthSubPage(updates.authSubPage);
        if (updates.signup) {
          if (updates.signup.step) auth.setSignupStep(updates.signup.step);
          if (updates.signup.role) auth.setRole(updates.signup.role);
          if (updates.signup.personalInfo) auth.setPersonalInfo(updates.signup.personalInfo);
          if (updates.signup.accountInfo) auth.setAccountInfo(updates.signup.accountInfo);
          if (updates.signup.terms) auth.setTerms(updates.signup.terms);
        }
        if (updates.login) auth.setLoginInfo(updates.login);
        break;
      case 'personManagement':
        if (updates.currentStep) personManagement.setCurrentStep(updates.currentStep);
        if (updates.selectedTab) personManagement.setSelectedTab(updates.selectedTab);
        if (updates.selectedClassId !== undefined) personManagement.setSelectedClassId(updates.selectedClassId);
        if (updates.selectedSessionId !== undefined) personManagement.setSelectedSessionId(updates.selectedSessionId);
        if (updates.selectedRequestId !== undefined) personManagement.setSelectedRequestId(updates.selectedRequestId);
        if (updates.selectedRequestType !== undefined) personManagement.setSelectedRequestType(updates.selectedRequestType);
        break;
      case 'principalCreateClass':
        if (updates.currentStep) principalCreateClass.setCurrentStep(updates.currentStep);
        if (updates.classFormData) principalCreateClass.setClassFormData(updates.classFormData);
        if (updates.selectedTeacherId !== undefined) principalCreateClass.setSelectedTeacherId(updates.selectedTeacherId);
        break;
      case 'principalPersonManagement':
        if (updates.currentStep) principalPersonManagement.setCurrentStep(updates.currentStep);
        if (updates.selectedTab) principalPersonManagement.setSelectedTab(updates.selectedTab);
        if (updates.selectedClassId !== undefined) principalPersonManagement.setSelectedClassId(updates.selectedClassId);
        if (updates.selectedSessionId !== undefined) principalPersonManagement.setSelectedSessionId(updates.selectedSessionId);
        if (updates.selectedRequestId !== undefined) principalPersonManagement.setSelectedRequestId(updates.selectedRequestId);
        if (updates.selectedRequestType !== undefined) principalPersonManagement.setSelectedRequestType(updates.selectedRequestType);
        break;
    }
  }, [enrollment, createClass, auth, personManagement, principalCreateClass, principalPersonManagement]);

  const resetAllForms = useCallback(() => {
    enrollment.reset();
    createClass.reset();
    auth.reset();
    personManagement.reset();
    principalCreateClass.reset();
    principalPersonManagement.reset();
  }, [enrollment, createClass, auth, personManagement, principalCreateClass, principalPersonManagement]);

  const getFormState = useCallback((formType: string) => {
    switch (formType) {
      case 'enrollment':
        return enrollment.state;
      case 'createClass':
        return createClass.state;
      case 'auth':
        return auth.state;
      case 'personManagement':
        return personManagement.state;
      case 'principalCreateClass':
        return principalCreateClass.state;
      case 'principalPersonManagement':
        return principalPersonManagement.state;
      default:
        return null;
    }
  }, [enrollment, createClass, auth, personManagement, principalCreateClass, principalPersonManagement]);

  // 메모이제이션된 value 객체
  const contextValue = useMemo(() => ({
        // Navigation
        activeTab: navigation.activeTab,
        subPage: navigation.subPage,
        canGoBack: navigation.canGoBack,
        isTransitioning: navigation.isTransitioning,
        navigationItems: navigation.navigationItems,
        history: navigation.history,
        setActiveTab: navigation.setActiveTab,
        handleTabChange: navigation.handleTabChange,
        navigateToSubPage: navigation.navigateToSubPage,
        clearSubPage: navigation.clearSubPage,
        goBack: navigation.goBack,

        // Forms
        forms: {
          enrollment,
          createClass,
          auth,
          personManagement,
          principalCreateClass,
          principalPersonManagement,
        },

        // UI
        ui,

        // Data
        data,

        // Session
        session,

        // 통합된 goBack (하위 호환성)
        goBackLegacy: navigation.goBack,
        
        // 고급 goBack 시스템 (새로운 설계)
        goBackAdvanced,
        
        // 통합 폼 관리 (Legacy 호환)
        updateForm,
        resetAllForms,
        getFormState,

        // 하위 호환성을 위한 직접 접근
        navigation,
        form: {
          enrollment,
          createClass,
          principalCreateClass,
          auth,
          personManagement,
          principalPersonManagement,
        },

        // 하위 호환성을 위한 직접 메서드들
        // 수강신청 관련
        setEnrollmentStep: enrollment.setCurrentStep,
        setSelectedMonth: enrollment.setSelectedMonth,
        setSelectedClasses: enrollment.setSelectedClasses,
        setSelectedSessions: enrollment.setSelectedSessions,
        setSelectedClassIds: enrollment.setSelectedClassIds,
        setSelectedAcademyId: enrollment.setSelectedAcademyId,
        setSelectedClassesWithSessions: enrollment.setSelectedClassesWithSessions,
        resetEnrollment: enrollment.reset,

        // 클래스 생성 관련
        setCreateClassStep: createClass.setCurrentStep,
        setClassFormData: createClass.setClassFormData,
        setSelectedTeacherId: createClass.setSelectedTeacherId,
        resetCreateClass: createClass.reset,

        // Principal 클래스 생성 관련
        setPrincipalCreateClassStep: principalCreateClass.setCurrentStep,
        setPrincipalClassFormData: principalCreateClass.setClassFormData,
        setPrincipalSelectedTeacherId: principalCreateClass.setSelectedTeacherId,
        resetPrincipalCreateClass: principalCreateClass.reset,

        // 인증 관련
        setAuthMode: auth.setAuthMode,
        setAuthSubPage: auth.setAuthSubPage,
        navigateToAuthSubPage: auth.navigateToAuthSubPage,
        goBackFromAuth: auth.goBackFromAuth,
        clearAuthSubPage: auth.clearAuthSubPage,
        setSignupStep: auth.setSignupStep,
        setRole: auth.setRole,
        setPersonalInfo: auth.setPersonalInfo,
        setAccountInfo: auth.setAccountInfo,
        setTerms: auth.setTerms,
        resetSignup: auth.resetSignup,
        setLoginInfo: auth.setLoginInfo,
        resetLogin: auth.resetLogin,

        // 인원 관리 관련
        setPersonManagementStep: personManagement.setCurrentStep,
        setPersonManagementTab: personManagement.setSelectedTab,
        setSelectedClassId: personManagement.setSelectedClassId,
        setSelectedSessionId: personManagement.setSelectedSessionId,
        setSelectedRequestId: personManagement.setSelectedRequestId,
        setSelectedRequestType: personManagement.setSelectedRequestType,
        resetPersonManagement: personManagement.reset,
      }), [
    // 의존성 배열
    navigation.activeTab, navigation.subPage, navigation.canGoBack, navigation.isTransitioning,
    navigation.navigationItems, navigation.history, navigation.setActiveTab, navigation.handleTabChange,
    navigation.navigateToSubPage, navigation.clearSubPage, navigation.goBack,
    enrollment, createClass, auth, personManagement, principalCreateClass, principalPersonManagement,
    ui, data, session
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 메인 AppProvider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <NavigationProvider>
      <EnrollmentFormProvider>
        <CreateClassFormProvider>
          <AuthFormProvider>
            <PersonManagementFormProvider>
              <PrincipalCreateClassFormProvider>
                <PrincipalPersonManagementFormProvider>
                  <UIContextProvider>
                    <DataContextProvider>
                      <NavigationConsumer>
                        <FormsConsumer>
                          {children}
                        </FormsConsumer>
                      </NavigationConsumer>
                    </DataContextProvider>
                  </UIContextProvider>
                </PrincipalPersonManagementFormProvider>
              </PrincipalCreateClassFormProvider>
            </PersonManagementFormProvider>
          </AuthFormProvider>
        </CreateClassFormProvider>
      </EnrollmentFormProvider>
    </NavigationProvider>
  );
};

// 하위 호환성을 위한 개별 Context들
export const useNavigationContext = useNavigation;
export const useEnrollmentFormContext = useEnrollmentForm;
export const useCreateClassFormContext = useCreateClassForm;
export const useAuthFormContext = useAuthForm;
export const usePersonManagementFormContext = usePersonManagementForm;
export const useUIContext = useUI;
export const useDataContext = useData;
