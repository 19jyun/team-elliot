// src/contexts/AppContext.tsx
'use client';

import React, { createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { FormDataMap } from './types/FormData';
import { EnrollmentStep, ClassesWithSessionsByMonthResponse, SessionData } from './forms/EnrollmentFormManager';
import { CreateClassStep, ClassFormData } from './forms/CreateClassFormManager';
import { PrincipalClassFormData } from './forms/PrincipalCreateClassFormManager';
import { SignupStep, AuthMode, SignupData, LoginData } from './forms/AuthFormManager';
import { PrincipalPersonManagementStep } from './forms/PersonManagementFormManager';

// Navigation Context
import { NavigationProvider, useNavigation } from './NavigationContext';
import { NavigationItem, NavigationHistoryItem } from './types/NavigationTypes';

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

// Event Bus (사용하지 않음 - 제거 예정)

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
  updateForm: <T extends keyof FormDataMap>(
    formType: T,
    updates: Partial<FormDataMap[T]>
  ) => void;
  resetAllForms: () => void;
  getFormState: (formType: string) => unknown;

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
  setEnrollmentStep: (step: EnrollmentStep) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedClasses: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  setSelectedSessions: (sessions: SessionData[]) => void;
  setSelectedClassIds: (classIds: number[]) => void;
  setSelectedAcademyId: (academyId: number | null) => void;
  setSelectedClassesWithSessions: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  resetEnrollment: () => void;

  // 클래스 생성 관련
  setCreateClassStep: (step: CreateClassStep) => void;
  setClassFormData: (data: Partial<ClassFormData>) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;
  resetCreateClass: () => void;

  // Principal 클래스 생성 관련
  setPrincipalCreateClassStep: (step: CreateClassStep) => void;
  setPrincipalClassFormData: (data: Partial<PrincipalClassFormData>) => void;
  setPrincipalSelectedTeacherId: (teacherId: number | null) => void;
  resetPrincipalCreateClass: () => void;

  // 인증 관련
  setAuthMode: (mode: AuthMode) => void;
  setAuthSubPage: (page: string | null) => void;
  navigateToAuthSubPage: (page: string) => void;
  goBackFromAuth: () => void;
  clearAuthSubPage: () => void;
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: 'STUDENT' | 'TEACHER') => void;
  setPersonalInfo: (info: SignupData['personalInfo']) => void;
  setAccountInfo: (info: SignupData['accountInfo']) => void;
  setTerms: (terms: SignupData['terms']) => void;
  resetSignup: () => void;
  setLoginInfo: (info: LoginData) => void;
  resetLogin: () => void;

  // 인원 관리 관련
  setPersonManagementStep: (step: PrincipalPersonManagementStep) => void;
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
  return <>{children}</>;
};

const FormsConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const enrollment = useEnrollmentForm();
  const createClass = useCreateClassForm();
  const auth = useAuthForm();
  const personManagement = usePersonManagementForm();
  const principalCreateClass = usePrincipalCreateClassForm();
  const principalPersonManagement = usePrincipalPersonManagementForm();
  const ui = useUI();
  const data = useData();
  const session = useSession();
  const navigation = useNavigation();

  // 고급 goBack 시스템 (새로운 설계)
  const goBackAdvanced = useCallback(async (): Promise<boolean> => {
    // NavigationContext의 고급 goBack 시스템 사용
    return await navigation.goBack();
  }, [navigation]);

  // 통합 폼 관리 메서드들 (Legacy 호환)
  const updateForm = useCallback(<T extends string>(
    formType: T,
    updates: Record<string, unknown>
  ) => {
    switch (formType) {
      case 'enrollment':
        // enrollment 폼 업데이트는 개별 메서드들을 통해 처리
        if (updates.currentStep) enrollment.setCurrentStep(updates.currentStep as EnrollmentStep);
        if (updates.selectedMonth !== undefined) enrollment.setSelectedMonth(updates.selectedMonth as number);
        if (updates.selectedClasses) enrollment.setSelectedClasses(updates.selectedClasses as ClassesWithSessionsByMonthResponse[]);
        if (updates.selectedSessions) enrollment.setSelectedSessions(updates.selectedSessions as SessionData[]);
        if (updates.selectedClassIds) enrollment.setSelectedClassIds(updates.selectedClassIds as number[]);
        if (updates.selectedAcademyId !== undefined) enrollment.setSelectedAcademyId(updates.selectedAcademyId as number | null);
        if (updates.selectedClassesWithSessions) enrollment.setSelectedClassesWithSessions(updates.selectedClassesWithSessions as ClassesWithSessionsByMonthResponse[]);
        break;
      case 'createClass':
        if (updates.currentStep) createClass.setCurrentStep(updates.currentStep as CreateClassStep);
        if (updates.classFormData) createClass.setClassFormData(updates.classFormData as Partial<ClassFormData>);
        if (updates.selectedTeacherId !== undefined) createClass.setSelectedTeacherId(updates.selectedTeacherId as number | null);
        break;
      case 'auth':
        if (updates.authMode) auth.setAuthMode(updates.authMode as AuthMode);
        if (updates.authSubPage !== undefined) auth.setAuthSubPage(updates.authSubPage as string | null);
        if (updates.signup) {
          const signup = updates.signup as Partial<SignupData>;
          if (signup.step) auth.setSignupStep(signup.step as SignupStep);
          if (signup.role) auth.setRole(signup.role as 'STUDENT' | 'TEACHER');
          if (signup.personalInfo) auth.setPersonalInfo(signup.personalInfo);
          if (signup.accountInfo) auth.setAccountInfo(signup.accountInfo);
          if (signup.terms) auth.setTerms(signup.terms);
        }
        if (updates.login) auth.setLoginInfo(updates.login as LoginData);
        break;
      case 'personManagement':
        if (updates.currentStep) personManagement.setCurrentStep(updates.currentStep as PrincipalPersonManagementStep);
        if (updates.selectedTab) personManagement.setSelectedTab(updates.selectedTab as 'enrollment' | 'refund');
        if (updates.selectedClassId !== undefined) personManagement.setSelectedClassId(updates.selectedClassId as number | null);
        if (updates.selectedSessionId !== undefined) personManagement.setSelectedSessionId(updates.selectedSessionId as number | null);
        if (updates.selectedRequestId !== undefined) personManagement.setSelectedRequestId(updates.selectedRequestId as number | null);
        if (updates.selectedRequestType !== undefined) personManagement.setSelectedRequestType(updates.selectedRequestType as 'enrollment' | 'refund' | null);
        break;
      case 'principalCreateClass':
        if (updates.currentStep) principalCreateClass.setCurrentStep(updates.currentStep as CreateClassStep);
        if (updates.classFormData) principalCreateClass.setClassFormData(updates.classFormData as Partial<PrincipalClassFormData>);
        if (updates.selectedTeacherId !== undefined) principalCreateClass.setSelectedTeacherId(updates.selectedTeacherId as number | null);
        break;
      case 'principalPersonManagement':
        if (updates.currentStep) principalPersonManagement.setCurrentStep(updates.currentStep as PrincipalPersonManagementStep);
        if (updates.selectedTab) principalPersonManagement.setSelectedTab(updates.selectedTab as 'enrollment' | 'refund');
        if (updates.selectedClassId !== undefined) principalPersonManagement.setSelectedClassId(updates.selectedClassId as number | null);
        if (updates.selectedSessionId !== undefined) principalPersonManagement.setSelectedSessionId(updates.selectedSessionId as number | null);
        if (updates.selectedRequestId !== undefined) principalPersonManagement.setSelectedRequestId(updates.selectedRequestId as number | null);
        if (updates.selectedRequestType !== undefined) principalPersonManagement.setSelectedRequestType(updates.selectedRequestType as 'enrollment' | 'refund' | null);
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
    navigation, enrollment, createClass, auth, personManagement, principalCreateClass, principalPersonManagement,
    ui, data, session, getFormState, goBackAdvanced, resetAllForms, updateForm
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
