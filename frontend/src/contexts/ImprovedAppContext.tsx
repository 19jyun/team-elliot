// src/contexts/ImprovedAppContext.tsx
'use client';

import React, { createContext, useContext, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StateSyncProvider, useStateSync } from './state/StateSyncContext';
import { ImprovedNavigationProvider, useImprovedNavigation } from './navigation/ImprovedNavigationContext';
import { ImprovedFormsProvider, useImprovedForms } from './forms/ImprovedFormsContext';
import { UIContextProvider, useUI } from './UIContext';
import { DataContextProvider, useData } from './DataContext';
import { FormsState } from './state/StateSyncTypes';
import { EnrollmentStep } from './forms/EnrollmentFormManager';
import { CreateClassStep } from './forms/CreateClassFormManager';
import { AuthMode, SignupStep } from './forms/AuthFormManager';
import { PrincipalPersonManagementStep } from './forms/PersonManagementFormManager';
import { PrincipalCreateClassStep } from './forms/PrincipalCreateClassFormManager';

// 통합된 AppContext 타입
interface ImprovedAppContextType {
  // Navigation
  navigation: ReturnType<typeof useImprovedNavigation>;
  
  // Forms
  forms: ReturnType<typeof useImprovedForms>;
  
  // UI
  ui: ReturnType<typeof useUI>;
  
  // Data
  data: ReturnType<typeof useData>;
  
  // Session
  session: ReturnType<typeof useSession>;
  
  // StateSync
  stateSync: ReturnType<typeof useStateSync>;
  
  // 통합된 goBack (하위 호환성)
  goBack: () => Promise<boolean>;
  
  // 통합 폼 관리 (Legacy 호환)
  updateForm: <T extends keyof FormsState>(
    formType: T,
    updates: Partial<FormsState[T]>
  ) => void;
  resetAllForms: () => void;
  getFormState: <T extends keyof FormsState>(formType: T) => FormsState[T];
  
  // 하위 호환성을 위한 직접 접근 (Legacy API)
  activeTab: number;
  subPage: string | null;
  canGoBack: boolean;
  isTransitioning: boolean;
  navigationItems: ReturnType<typeof useImprovedNavigation>['navigationItems'];
  history: ReturnType<typeof useImprovedNavigation>['history'];
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  navigateToSubPage: (page: string) => void;
  clearSubPage: () => void;
  clearHistory: () => void;
  
  // 하위 호환성을 위한 폼 접근
  form: {
    enrollment: ReturnType<typeof useImprovedForms>['enrollment'];
    createClass: ReturnType<typeof useImprovedForms>['createClass'];
    principalCreateClass: ReturnType<typeof useImprovedForms>['principalCreateClass'];
    auth: ReturnType<typeof useImprovedForms>['auth'];
    personManagement: ReturnType<typeof useImprovedForms>['personManagement'];
    principalPersonManagement: ReturnType<typeof useImprovedForms>['principalPersonManagement'];
  };
  
  // 하위 호환성을 위한 직접 메서드들
  // 수강신청 관련
  setEnrollmentStep: (step: EnrollmentStep) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedClasses: (classes: unknown[]) => void;
  setSelectedSessions: (sessions: unknown[]) => void;
  setSelectedClassIds: (classIds: number[]) => void;
  setSelectedAcademyId: (academyId: number | null) => void;
  setSelectedClassesWithSessions: (classes: unknown[]) => void;
  resetEnrollment: () => void;
  
  // 클래스 생성 관련
  setCreateClassStep: (step: CreateClassStep) => void;
  setClassFormData: (data: unknown) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;
  resetCreateClass: () => void;
  
  // Principal 클래스 생성 관련
  setPrincipalCreateClassStep: (step: PrincipalCreateClassStep) => void;
  setPrincipalClassFormData: (data: unknown) => void;
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
  setPersonalInfo: (info: unknown) => void;
  setAccountInfo: (info: unknown) => void;
  setTerms: (terms: unknown) => void;
  resetSignup: () => void;
  setLoginInfo: (info: unknown) => void;
  resetLogin: () => void;
  
  // 인원 관리 관련
  setPersonManagementStep: (step: PrincipalPersonManagementStep) => void;
  setPersonManagementTab: (tab: 'enrollment' | 'refund') => void;
  setSelectedClassId: (classId: number | null) => void;
  setSelectedSessionId: (sessionId: number | null) => void;
  setSelectedRequestId: (requestId: number | null) => void;
  setSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => void;
  resetPersonManagement: () => void;
  
  // Principal 인원 관리 관련
  setPrincipalPersonManagementStep: (step: PrincipalPersonManagementStep) => void;
  setPrincipalPersonManagementTab: (tab: 'enrollment' | 'refund') => void;
  setPrincipalSelectedClassId: (classId: number | null) => void;
  setPrincipalSelectedSessionId: (sessionId: number | null) => void;
  setPrincipalSelectedRequestId: (requestId: number | null) => void;
  setPrincipalSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => void;
  resetPrincipalPersonManagement: () => void;
  
  // 탭 전환 시 초기화 메소드
  switchPrincipalPersonManagementTab: (tab: 'enrollment' | 'refund') => void;
}

const ImprovedAppContext = createContext<ImprovedAppContextType | undefined>(undefined);

export const useImprovedApp = (): ImprovedAppContextType => {
  const context = useContext(ImprovedAppContext);
  if (!context) {
    throw new Error('useImprovedApp must be used within an ImprovedAppProvider');
  }
  return context;
};

// 내부 컴포넌트들
const AppConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useImprovedNavigation();
  const forms = useImprovedForms();
  const ui = useUI();
  const data = useData();
  const session = useSession();
  const stateSync = useStateSync();

  // formsState를 navigation에 전달
  const formsState: FormsState = {
    enrollment: forms.enrollment,
    createClass: forms.createClass,
    auth: forms.auth,
    personManagement: forms.personManagement,
    principalCreateClass: forms.principalCreateClass,
    principalPersonManagement: forms.principalPersonManagement,
  };

  // 통합된 goBack (하위 호환성)
  const goBack = useCallback(async (): Promise<boolean> => {
    return await navigation.goBackWithForms(formsState);
  }, [navigation, formsState]);

  // 통합 폼 관리 메서드들 (Legacy 호환)
  const updateForm = useCallback(<T extends keyof FormsState>(
    formType: T,
    updates: Partial<FormsState[T]>
  ) => {
    forms.updateForm(formType, updates);
  }, [forms]);

  const resetAllForms = useCallback(() => {
    forms.resetAllForms();
  }, [forms]);

  const getFormState = useCallback(<T extends keyof FormsState>(formType: T): FormsState[T] => {
    return forms.getFormState(formType);
  }, [forms]);

  // 브라우저 뒤로가기 버튼 처리 (통합된 goBack 사용)
  useEffect(() => {
    const handleBrowserBackButton = async (event: PopStateEvent) => {
      event.preventDefault();
      
      // 통합된 goBack 사용 (ImprovedGoBackManager를 통해 단계별 로직 처리)
      const success = await goBack();
      
      // 뒤로갈 수 없으면 히스토리에 현재 상태 추가
      if (!success) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    // 브라우저 뒤로가기 버튼 리스너
    window.addEventListener('popstate', handleBrowserBackButton);
    
    // 초기 상태를 히스토리에 추가
    window.history.pushState(null, '', window.location.href);
    
    return () => {
      window.removeEventListener('popstate', handleBrowserBackButton);
    };
  }, [goBack]);

  // 메모이제이션된 value 객체
  const contextValue = useMemo(() => ({
    // 새로운 구조
    navigation,
    forms,
    ui,
    data,
    session,
    stateSync,
    
    // 통합된 goBack (하위 호환성)
    goBack,
    
    // 통합 폼 관리 (Legacy 호환)
    updateForm,
    resetAllForms,
    getFormState,
    
    // 하위 호환성을 위한 직접 접근
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
    clearHistory: navigation.clearHistory,
    
    // 하위 호환성을 위한 폼 접근
    form: {
      enrollment: forms.enrollment,
      createClass: forms.createClass,
      principalCreateClass: forms.principalCreateClass,
      auth: forms.auth,
      personManagement: forms.personManagement,
      principalPersonManagement: forms.principalPersonManagement,
    },
    
    // 하위 호환성을 위한 직접 메서드들
    // 수강신청 관련
    setEnrollmentStep: forms.setEnrollmentStep,
    setSelectedMonth: (month: number) => forms.setEnrollmentData({ selectedMonth: month }),
    setSelectedClasses: (classes: unknown[]) => forms.setEnrollmentData({ selectedClasses: classes as any }),
    setSelectedSessions: (sessions: unknown[]) => forms.setEnrollmentData({ selectedSessions: sessions as any }),
    setSelectedClassIds: (classIds: number[]) => forms.setEnrollmentData({ selectedClassIds: classIds }),
    setSelectedAcademyId: (academyId: number | null) => forms.setEnrollmentData({ selectedAcademyId: academyId }),
    setSelectedClassesWithSessions: (classes: unknown[]) => forms.setEnrollmentData({ selectedClassesWithSessions: classes as any }),
    resetEnrollment: forms.resetEnrollment,
    
    // 클래스 생성 관련
    setCreateClassStep: forms.setCreateClassStep,
    setClassFormData: (data: unknown) => forms.setCreateClassData({ classFormData: data as any }),
    setSelectedTeacherId: (teacherId: number | null) => forms.setCreateClassData({ selectedTeacherId: teacherId }),
    resetCreateClass: forms.resetCreateClass,
    
    // Principal 클래스 생성 관련
    setPrincipalCreateClassStep: forms.setPrincipalCreateClassStep,
    setPrincipalClassFormData: (data: unknown) => forms.setPrincipalCreateClassData({ classFormData: data as any }),
    setPrincipalSelectedTeacherId: (teacherId: number | null) => forms.setPrincipalCreateClassData({ selectedTeacherId: teacherId }),
    resetPrincipalCreateClass: forms.resetPrincipalCreateClass,
    
    // 인증 관련
    setAuthMode: forms.setAuthMode,
    setAuthSubPage: (page: string | null) => forms.setAuthData({ authSubPage: page }),
    navigateToAuthSubPage: (page: string) => forms.setAuthData({ authSubPage: page }),
    goBackFromAuth: () => forms.setAuthData({ authSubPage: null }),
    clearAuthSubPage: () => forms.setAuthData({ authSubPage: null }),
    setSignupStep: forms.setAuthStep,
    setRole: (role: 'STUDENT' | 'TEACHER') => forms.setAuthData({ signup: { role } as any }),
    setPersonalInfo: (info: unknown) => forms.setAuthData({ signup: { personalInfo: info as any } as any }),
    setAccountInfo: (info: unknown) => forms.setAuthData({ signup: { accountInfo: info as any } as any }),
    setTerms: (terms: unknown) => forms.setAuthData({ signup: { terms: terms as any } as any }),
    resetSignup: () => forms.resetAuth(),
    setLoginInfo: (info: unknown) => forms.setAuthData({ login: info as any }),
    resetLogin: () => forms.resetAuth(),
    
    // 인원 관리 관련
    setPersonManagementStep: forms.setPersonManagementStep,
    setPersonManagementTab: (tab: 'enrollment' | 'refund') => forms.setPersonManagementData({ selectedTab: tab }),
    setSelectedClassId: (classId: number | null) => forms.setPersonManagementData({ selectedClassId: classId }),
    setSelectedSessionId: (sessionId: number | null) => forms.setPersonManagementData({ selectedSessionId: sessionId }),
    setSelectedRequestId: (requestId: number | null) => forms.setPersonManagementData({ selectedRequestId: requestId }),
    setSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => forms.setPersonManagementData({ selectedRequestType: requestType }),
    resetPersonManagement: forms.resetPersonManagement,
    
    // Principal 인원 관리 관련
    setPrincipalPersonManagementStep: forms.setPrincipalPersonManagementStep,
    setPrincipalPersonManagementTab: (tab: 'enrollment' | 'refund') => forms.setPrincipalPersonManagementData({ selectedTab: tab }),
    setPrincipalSelectedClassId: (classId: number | null) => forms.setPrincipalPersonManagementData({ selectedClassId: classId }),
    setPrincipalSelectedSessionId: (sessionId: number | null) => forms.setPrincipalPersonManagementData({ selectedSessionId: sessionId }),
    setPrincipalSelectedRequestId: (requestId: number | null) => forms.setPrincipalPersonManagementData({ selectedRequestId: requestId }),
    setPrincipalSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => forms.setPrincipalPersonManagementData({ selectedRequestType: requestType }),
    resetPrincipalPersonManagement: forms.resetPrincipalPersonManagement,
    
    // 탭 전환 시 초기화 메소드
    switchPrincipalPersonManagementTab: (tab: 'enrollment' | 'refund') => {
      forms.switchPrincipalPersonManagementTab(tab);
    },
  }), [
    navigation, forms, ui, data, session, stateSync,
    goBack, updateForm, resetAllForms, getFormState
  ]);

  return (
    <ImprovedAppContext.Provider value={contextValue}>
      {children}
    </ImprovedAppContext.Provider>
  );
};

// 메인 ImprovedAppProvider
interface ImprovedAppProviderProps {
  children: ReactNode;
}

export const ImprovedAppProvider: React.FC<ImprovedAppProviderProps> = ({ children }) => {
  return (
    <StateSyncProvider>
      <ImprovedFormsProvider>
        <ImprovedNavigationProvider>
          <UIContextProvider>
            <DataContextProvider>
              <AppConsumer>
                {children}
              </AppConsumer>
            </DataContextProvider>
          </UIContextProvider>
        </ImprovedNavigationProvider>
      </ImprovedFormsProvider>
    </StateSyncProvider>
  );
};

// 하위 호환성을 위한 개별 Context들
export const useNavigationContext = useImprovedNavigation;
export const useEnrollmentFormContext = () => useImprovedForms().forms.enrollment;
export const useCreateClassFormContext = () => useImprovedForms().forms.createClass;
export const useAuthFormContext = () => useImprovedForms().forms.auth;
export const usePersonManagementFormContext = () => useImprovedForms().forms.personManagement;
export const useUIContext = useUI;
export const useDataContext = useData;
