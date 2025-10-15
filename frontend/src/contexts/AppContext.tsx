// src/contexts/AppContext.tsx
'use client';

import React, { createContext, useContext, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { StateSyncProvider, useStateSync } from './state/StateSyncContext';
import { NavigationProvider, useNavigation } from './navigation/NavigationContext';
import { FormsProvider, useForms } from './forms/FormsContext';
import { UIContextProvider, useUI } from './UIContext';
import { DataContextProvider, useData } from './DataContext';
import { FormsState } from './state/StateSyncTypes';
import { EnrollmentStep, ClassesWithSessionsByMonthResponse, ExtendedSessionData } from './forms/EnrollmentFormManager';
import { CreateClassStep, ClassFormData } from './forms/CreateClassFormManager';
import { AuthMode, SignupStep, SignupData, LoginData } from './forms/AuthFormManager';
import { PrincipalPersonManagementStep } from './forms/PersonManagementFormManager';
import { PrincipalCreateClassStep, PrincipalClassFormData } from './forms/PrincipalCreateClassFormManager';

// 통합된 AppContext 타입
interface AppContextType {
  // Navigation
  navigation: ReturnType<typeof useNavigation>;
  
  // Forms
  forms: ReturnType<typeof useForms>;
  
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
  navigationItems: ReturnType<typeof useNavigation>['navigationItems'];
  history: ReturnType<typeof useNavigation>['history'];
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  navigateToSubPage: (page: string) => void;
  clearSubPage: () => void;
  clearHistory: () => void;
  
  // 하위 호환성을 위한 폼 접근
  form: {
    enrollment: ReturnType<typeof useForms>['enrollment'];
    createClass: ReturnType<typeof useForms>['createClass'];
    principalCreateClass: ReturnType<typeof useForms>['principalCreateClass'];
    auth: ReturnType<typeof useForms>['auth'];
    personManagement: ReturnType<typeof useForms>['personManagement'];
    principalPersonManagement: ReturnType<typeof useForms>['principalPersonManagement'];
  };
  
  // 하위 호환성을 위한 직접 메서드들
  // 수강신청 관련
  setEnrollmentStep: (step: EnrollmentStep) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedClasses: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  setSelectedSessions: (sessions: ExtendedSessionData[]) => void;
  setSelectedClassIds: (classIds: number[]) => void;
  setSelectedAcademyId: (academyId: number | null) => void;
  setSelectedClassesWithSessions: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  resetEnrollment: () => void;
  
  // 클래스 생성 관련
  setCreateClassStep: (step: CreateClassStep) => void;
  setClassFormData: (data: ClassFormData) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;
  resetCreateClass: () => void;
  
  // Principal 클래스 생성 관련
  setPrincipalCreateClassStep: (step: PrincipalCreateClassStep) => void;
  setPrincipalClassFormData: (data: PrincipalClassFormData) => void;
  setPrincipalSelectedTeacherId: (teacherId: number | null) => void;
  resetPrincipalCreateClass: () => void;
  
  // 인증 관련
  setAuthMode: (mode: AuthMode) => void;
  setAuthSubPage: (page: string | null) => void;
  navigateToAuthSubPage: (page: string) => void;
  goBackFromAuth: () => void;
  clearAuthSubPage: () => void;
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL') => void;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 내부 컴포넌트들
const AppConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const forms = useForms();
  const ui = useUI();
  const data = useData();
  const session = useSession();
  const stateSync = useStateSync();

  // formsState를 navigation에 전달
  const formsState: FormsState = useMemo(() => ({
    enrollment: forms.enrollment,
    createClass: forms.createClass,
    auth: forms.auth,
    personManagement: forms.personManagement,
    principalCreateClass: forms.principalCreateClass,
    principalPersonManagement: forms.principalPersonManagement,
  }), [forms.enrollment, forms.createClass, forms.auth, forms.personManagement, forms.principalCreateClass, forms.principalPersonManagement]);

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
      
      // 통합된 goBack 사용 (GoBackManager를 통해 단계별 로직 처리)
      const success = await goBack();
      
      // 뒤로갈 수 없거나 signup-roles에서 뒤로가기한 경우 로그인 페이지로
      if (!success || navigation.subPage === 'signup-roles') {
        forms.setAuthMode('login');
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
    setSelectedClasses: (classes: ClassesWithSessionsByMonthResponse[]) => forms.setEnrollmentData({ selectedClasses: classes }),
    setSelectedSessions: (sessions: ExtendedSessionData[]) => forms.setEnrollmentData({ selectedSessions: sessions }),
    setSelectedClassIds: (classIds: number[]) => forms.setEnrollmentData({ selectedClassIds: classIds }),
    setSelectedAcademyId: (academyId: number | null) => forms.setEnrollmentData({ selectedAcademyId: academyId }),
    setSelectedClassesWithSessions: (classes: ClassesWithSessionsByMonthResponse[]) => forms.setEnrollmentData({ selectedClassesWithSessions: classes }),
    resetEnrollment: forms.resetEnrollment,
    
    // 클래스 생성 관련
    setCreateClassStep: forms.setCreateClassStep,
    setClassFormData: (data: ClassFormData) => forms.setCreateClassData({ classFormData: data }),
    setSelectedTeacherId: (teacherId: number | null) => forms.setCreateClassData({ selectedTeacherId: teacherId }),
    resetCreateClass: forms.resetCreateClass,
    
    // Principal 클래스 생성 관련
    setPrincipalCreateClassStep: forms.setPrincipalCreateClassStep,
    setPrincipalClassFormData: (data: PrincipalClassFormData) => forms.setPrincipalCreateClassData({ classFormData: data }),
    setPrincipalSelectedTeacherId: (teacherId: number | null) => forms.setPrincipalCreateClassData({ selectedTeacherId: teacherId }),
    resetPrincipalCreateClass: forms.resetPrincipalCreateClass,
    
    // 인증 관련
    setAuthMode: forms.setAuthMode,
    setAuthSubPage: (page: string | null) => forms.setAuthData({ authSubPage: page }),
    navigateToAuthSubPage: (page: string) => forms.setAuthData({ authSubPage: page }),
    goBackFromAuth: () => forms.setAuthData({ authSubPage: null }),
    clearAuthSubPage: () => forms.setAuthData({ authSubPage: null }),
    setSignupStep: forms.setAuthStep,
    setRole: (role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL') => forms.setAuthData({ signup: { ...forms.auth.signup, role } }),
    setPersonalInfo: (info: SignupData['personalInfo']) => forms.setAuthData({ signup: { ...forms.auth.signup, personalInfo: info } }),
    setAccountInfo: (info: SignupData['accountInfo']) => forms.setAuthData({ signup: { ...forms.auth.signup, accountInfo: info } }),
    setTerms: (terms: SignupData['terms']) => forms.setAuthData({ signup: { ...forms.auth.signup, terms: terms } }),
    resetSignup: () => forms.resetAuth(),
    setLoginInfo: (info: LoginData) => forms.setAuthData({ login: info }),
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
    <StateSyncProvider>
      <FormsProvider>
        <NavigationProvider>
          <UIContextProvider>
            <DataContextProvider>
              <AppConsumer>
                {children}
              </AppConsumer>
            </DataContextProvider>
          </UIContextProvider>
        </NavigationProvider>
      </FormsProvider>
    </StateSyncProvider>
  );
};

// 하위 호환성을 위한 개별 Context들
export const useNavigationContext = useNavigation;
export const useEnrollmentFormContext = () => useForms().forms.enrollment;
export const useCreateClassFormContext = () => useForms().forms.createClass;
export const useAuthFormContext = () => useForms().forms.auth;
export const usePersonManagementFormContext = () => useForms().forms.personManagement;
export const useUIContext = useUI;
export const useDataContext = useData;
