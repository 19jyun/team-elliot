// src/contexts/AppContext.tsx
'use client';

import React, { createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { NavigationProvider, useNavigation } from './navigation/NavigationContext';
import { FormsProvider, useForms, FormsState } from './forms/FormsContext';
import { UIContextProvider, useUI } from './UIContext';
import { EnrollmentStep, ClassesWithSessionsByMonthResponse, ExtendedSessionData, EnrollmentModificationData } from './forms/EnrollmentFormManager';
import { EnrollmentModificationStep } from './forms/EnrollmentModificationFormManager';
import { useRouter, usePathname } from 'next/navigation';
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
  
  // Session
  session: ReturnType<typeof useSession>;
  
  // 통합된 goBack (하위 호환성 - router.back() 사용)
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
  navigationItems: ReturnType<typeof useNavigation>['navigationItems'];
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  
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
  const session = useSession();


  const router = useRouter();
  const pathname = usePathname();

  // SessionDetail 상태 관리
  const [sessionDetailCurrentStep, setSessionDetailCurrentStep] = useState<SessionDetailStep>('main');
  
  const sessionDetailGoBack = useCallback(async (): Promise<boolean> => {
    if (sessionDetailCurrentStep === 'main') {
      // 메인 단계에서는 router.back() 사용
      router.back();
      return true;
    } else {
      // 하위 단계에서는 이전 단계로 이동
      setSessionDetailCurrentStep('main');
      return true;
    }
  }, [sessionDetailCurrentStep, router]);

  // 통합된 goBack (하위 호환성 - router.back() 사용)
  const goBack = useCallback(async (): Promise<boolean> => {
    // session-detail 페이지인 경우 sessionDetail 단계별 처리
    if (pathname?.includes('/session/')) {
      return await sessionDetailGoBack();
    }
    
    // /dashboard/{role} 경로에서는 뒤로가기 비활성화
    const isRoleDashboard = 
      pathname === '/dashboard/student' || 
      pathname === '/dashboard/teacher' || 
      pathname === '/dashboard/principal';
    
    if (isRoleDashboard) {
      return false; // 뒤로가기 비활성화
    }
    
    // 그 외 모든 경우 router.back() 사용
    router.back();
    return true;
  }, [router, pathname, sessionDetailGoBack]);

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

  // 브라우저 앞으로가기 방지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (_event: PopStateEvent) => {
      // 앞으로가기 방지: 히스토리 상태를 현재로 고정
      if (window.history.state && window.history.state.preventForward) {
        window.history.pushState({ preventForward: true }, '', window.location.href);
      }
    };

    // 초기 히스토리 상태 설정
    window.history.pushState({ preventForward: true }, '', window.location.href);
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Capacitor 뒤로가기 처리 (단순화)
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

        const handleNativeBackButton = async () => {
          // 현재 경로가 각 역할의 메인 대시보드인지 확인
          const isRoleDashboard = 
            pathname === '/dashboard/student' || 
            pathname === '/dashboard/teacher' || 
            pathname === '/dashboard/principal';
          
          const isMainDashboard = isRoleDashboard || pathname === '/dashboard';

          if (isRoleDashboard) {
            // /dashboard/{role} 경로에서는 뒤로가기 비활성화 (앱 종료)
            App.exitApp();
          } else if (isMainDashboard) {
            // /dashboard 경로에서도 앱 종료
            App.exitApp();
          } else {
            // 그 외 모든 페이지에서는 Next.js 라우터의 '뒤로가기'를 호출
            router.back();
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
  }, [router, pathname]); // pathname이 변경될 때마다 리스너가 최신 경로를 참조 

  // 메모이제이션된 value 객체
  const contextValue = useMemo(() => ({
    // 새로운 구조
    navigation,
    forms,
    ui,
    session,
    
    // 통합된 goBack (하위 호환성)
    goBack,
    
    // 통합 폼 관리 (Legacy 호환)
    updateForm,
    resetAllForms,
    getFormState,
    
    // 하위 호환성을 위한 직접 접근
    activeTab: navigation.activeTab,
    navigationItems: navigation.navigationItems,
    setActiveTab: navigation.setActiveTab,
    handleTabChange: navigation.handleTabChange,
    
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
    navigation, forms, ui, session,
    updateForm, resetAllForms, getFormState,
    sessionDetailCurrentStep, sessionDetailGoBack, goBack
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
    <FormsProvider>
      <NavigationProvider>
        <UIContextProvider>
          <AppConsumer>
            {children}
          </AppConsumer>
        </UIContextProvider>
      </NavigationProvider>
    </FormsProvider>
  );
};

// 하위 호환성을 위한 개별 Context들
export const useNavigationContext = useNavigation;
export const useEnrollmentFormContext = () => useForms().forms.enrollment;
export const useCreateClassFormContext = () => useForms().forms.createClass;
export const useAuthFormContext = () => useForms().forms.auth;
export const usePersonManagementFormContext = () => useForms().forms.personManagement;
export const useUIContext = useUI;
