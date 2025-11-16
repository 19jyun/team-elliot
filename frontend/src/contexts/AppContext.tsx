// src/contexts/AppContext.tsx
'use client';

import React, { createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useState, useRef } from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { StateSyncProvider, useStateSync } from './state/StateSyncContext';
import { NavigationProvider, useNavigation } from './navigation/NavigationContext';
import { FormsProvider, useForms } from './forms/FormsContext';
import { UIContextProvider, useUI } from './UIContext';
import { DataContextProvider, useData } from './DataContext';
import { FormsState, NavigationState } from './state/StateSyncTypes';
import { EnrollmentStep, ClassesWithSessionsByMonthResponse, ExtendedSessionData, EnrollmentModificationData } from './forms/EnrollmentFormManager';
import { BackButtonHandler } from './navigation/BackButtonHandler';
import { EnrollmentModificationStep } from './forms/EnrollmentModificationFormManager';
import { CreateClassStep, ClassFormData } from './forms/CreateClassFormManager';
import { AuthMode, SignupStep, SignupData, LoginData } from './forms/AuthFormManager';
import { PrincipalPersonManagementStep } from './forms/PersonManagementFormManager';
import { PrincipalCreateClassStep, PrincipalClassFormData } from './forms/PrincipalCreateClassFormManager';

// SessionDetail 단계 타입 정의
export type SessionDetailStep = 'main' | 'content' | 'pose';

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
  clearSubPage: () => Promise<void>;
  clearHistory: () => void;
  
  // 하위 호환성을 위한 폼 접근
  form: {
    enrollment: ReturnType<typeof useForms>['enrollment'];
    enrollmentModification: ReturnType<typeof useForms>['enrollmentModification'];
    createClass: ReturnType<typeof useForms>['createClass'];
    principalCreateClass: ReturnType<typeof useForms>['principalCreateClass'];
    auth: ReturnType<typeof useForms>['auth'];
    personManagement: ReturnType<typeof useForms>['personManagement'];
    principalPersonManagement: ReturnType<typeof useForms>['principalPersonManagement'];
  };
  
  // SessionDetail 상태 관리
  sessionDetail: {
    currentStep: SessionDetailStep;
    setCurrentStep: (step: SessionDetailStep) => void;
    goBack: () => Promise<boolean>;
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
  setModificationData: (data: EnrollmentModificationData | null) => void;
  resetEnrollment: () => void;
  
  // 수강 변경 관련
  setEnrollmentModificationStep: (step: EnrollmentModificationStep) => void;
  setEnrollmentModificationData: (data: Partial<ReturnType<typeof useForms>['enrollmentModification']>) => void;
  resetEnrollmentModification: () => void;
  
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
    enrollmentModification: forms.enrollmentModification,
    createClass: forms.createClass,
    auth: forms.auth,
    personManagement: forms.personManagement,
    principalCreateClass: forms.principalCreateClass,
    principalPersonManagement: forms.principalPersonManagement,
  }), [forms.enrollment, forms.enrollmentModification, forms.createClass, forms.auth, forms.personManagement, forms.principalCreateClass, forms.principalPersonManagement]);

  // SessionDetail 상태 관리
  const [sessionDetailCurrentStep, setSessionDetailCurrentStep] = useState<SessionDetailStep>('main');
  
  const sessionDetailGoBack = useCallback(async (): Promise<boolean> => {
    if (sessionDetailCurrentStep === 'main') {
      // 메인 단계에서는 navigation의 goBack 사용
      return await navigation.goBackWithForms(formsState);
    } else {
      // 하위 단계에서는 이전 단계로 이동
      setSessionDetailCurrentStep('main');
      return true;
    }
  }, [sessionDetailCurrentStep, navigation, formsState]);

  // 통합된 goBack (하위 호환성)
  const unifiedGoBack = useCallback(async (): Promise<boolean> => {
    // session-detail 서브페이지인 경우 sessionDetail 단계별 처리
    if (navigation.subPage === 'session-detail') {
      return await sessionDetailGoBack();
    }
    
    // 기존 navigation goBack 사용
    return await navigation.goBackWithForms(formsState);
  }, [navigation, sessionDetailGoBack, formsState]);

  // 하위 호환성을 위한 goBack (기존 코드와의 호환성)
  const goBack = useCallback(async (): Promise<boolean> => {
    return await unifiedGoBack();
  }, [unifiedGoBack]);

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

  // BackButtonHandler 인스턴스 생성 (단일 진입점)
  const [backButtonHandler] = useState(() => {
    const goBackManager = navigation.getGoBackManager();
    return new BackButtonHandler(goBackManager);
  });

  // 최신 navigation과 formsState를 참조하기 위한 ref
  const navigationRef = useRef(navigation);
  const formsStateRef = useRef(formsState);
  const formsRef = useRef(forms);

  // ref 업데이트 (렌더링마다 최신 값으로 갱신)
  useEffect(() => {
    navigationRef.current = navigation;
    formsStateRef.current = formsState;
    formsRef.current = forms;
  }, [navigation, formsState, forms]);

  // 브라우저 뒤로가기 버튼 처리 (BackButtonHandler 사용)
  useEffect(() => {
    const handleBrowserBackButton = async (event: PopStateEvent) => {
      // ref를 통해 최신 상태 참조
      const currentNavigation = navigationRef.current;
      const currentFormsState = formsStateRef.current;
      const currentForms = formsRef.current;
      
      // preventDefault 제거 (효과 없음 - popstate는 read-only 이벤트)
      
      // NavigationState 생성
      const navigationState: NavigationState = {
        activeTab: currentNavigation.activeTab,
        subPage: currentNavigation.subPage,
        canGoBack: currentNavigation.canGoBack,
        isTransitioning: currentNavigation.isTransitioning,
        navigationItems: currentNavigation.navigationItems,
        history: currentNavigation.history,
      };
      
      // BackButtonHandler를 통해 뒤로가기 처리 (상태 직접 전달)
      const success = await backButtonHandler.handleBackButton(
        undefined,
        navigationState,
        currentFormsState
      );
      
      if (!success) {
        // 히스토리 상태 동기화 (pushState 대신 replaceState 사용)
        window.history.replaceState(null, '', window.location.href);
      }
      
      // signup-roles에서 뒤로가기한 경우 로그인 페이지로
      if (currentNavigation.subPage === 'signup-roles') {
        currentForms.setAuthMode('login');
        window.history.replaceState(null, '', window.location.href);
      }
    };

    // 브라우저 뒤로가기 버튼 리스너
    window.addEventListener('popstate', handleBrowserBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBrowserBackButton);
    };
  }, [backButtonHandler]); // backButtonHandler만 dependency에 포함 (한 번만 등록)

  // 초기 히스토리 상태 설정 (한 번만 실행)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!window.history.state) {
      window.history.replaceState({ initialized: true }, '', window.location.href);
    }
  }, []); // 빈 dependency array - 마운트 시 한 번만 실행

  // Capacitor 뒤로가기 처리 (BackButtonHandler 사용)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeCapacitorBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const { Capacitor } = await import('@capacitor/core');

        const isNative = Capacitor.isNativePlatform();

        if (!isNative) {
          return; // 웹 환경에서는 등록하지 않음
        }

        const handleNativeBackButton = async ({ canGoBack }: { canGoBack: boolean }) => {
          // ref를 통해 최신 상태 참조
          const currentNavigation = navigationRef.current;
          const currentFormsState = formsStateRef.current;

          // NavigationState 생성
          const navigationState: NavigationState = {
            activeTab: currentNavigation.activeTab,
            subPage: currentNavigation.subPage,
            canGoBack: currentNavigation.canGoBack,
            isTransitioning: currentNavigation.isTransitioning,
            navigationItems: currentNavigation.navigationItems,
            history: currentNavigation.history,
          };

          // BackButtonHandler를 통해 뒤로가기 처리 (상태 직접 전달)
          const success = await backButtonHandler.handleBackButton(
            canGoBack,
            navigationState,
            currentFormsState
          );

          if (!success && !canGoBack) {
            // 더 이상 뒤로갈 수 없으면 앱 종료
            App.exitApp();
          }
        };

        const listener = await App.addListener('backButton', handleNativeBackButton);

        return () => {
          listener.remove();
        };
      } catch (error) {
        console.warn('Capacitor App plugin not available', error);
      }
    };

    const cleanup = initializeCapacitorBackButton();

    return () => {
      cleanup.then((fn) => {
        if (fn) {
          fn();
        }
      });
    };
  }, [backButtonHandler]); // backButtonHandler만 dependency에 포함 (한 번만 등록) 

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
    goBack: unifiedGoBack,
    
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
      enrollmentModification: forms.enrollmentModification,
      createClass: forms.createClass,
      principalCreateClass: forms.principalCreateClass,
      auth: forms.auth,
      personManagement: forms.personManagement,
      principalPersonManagement: forms.principalPersonManagement,
    },
    
    // SessionDetail 상태 관리
    sessionDetail: {
      currentStep: sessionDetailCurrentStep,
      setCurrentStep: setSessionDetailCurrentStep,
      goBack: sessionDetailGoBack,
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
    setModificationData: forms.setModificationData,
    resetEnrollment: forms.resetEnrollment,
    
    // 수강 변경 관련
    setEnrollmentModificationStep: forms.setEnrollmentModificationStep,
    setEnrollmentModificationData: forms.setEnrollmentModificationData,
    resetEnrollmentModification: forms.resetEnrollmentModification,
    
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
    updateForm, resetAllForms, getFormState,
    sessionDetailCurrentStep, sessionDetailGoBack, unifiedGoBack
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
