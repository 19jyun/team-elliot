'use client';

import React, { createContext, useContext, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { NavigationProvider, useNavigation } from './navigation/NavigationContext';
import { FormsProvider, useForms, FormsState } from './forms/FormsContext';
import { UIContextProvider, useUI } from './UIContext';
import { EnrollmentStep, ClassesWithSessionsByMonthResponse, ExtendedSessionData } from './forms/EnrollmentFormManager';
import { EnrollmentModificationStep, EnrollmentModificationFormState } from './forms/EnrollmentModificationFormManager';
import { useRouter, usePathname } from 'next/navigation';
import { SignupStep, SignupData } from './forms/AuthFormManager';
import { PrincipalCreateClassStep, PrincipalClassFormData } from './forms/PrincipalCreateClassFormManager';

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
    auth: ReturnType<typeof useForms>['auth'];
    principalCreateClass: ReturnType<typeof useForms>['principalCreateClass'];
  };
  
  // --- Enrollment ---
  setEnrollmentStep: (step: EnrollmentStep) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedClasses: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  setSelectedSessions: (sessions: ExtendedSessionData[]) => void;
  setSelectedClassIds: (classIds: number[]) => void;
  setSelectedAcademyId: (academyId: number | null) => void;
  setSelectedClassesWithSessions: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  resetEnrollment: () => void;
  
  // --- Enrollment Modification ---
  setEnrollmentModificationStep: (step: EnrollmentModificationStep) => void;
  setEnrollmentModificationData: (data: Partial<EnrollmentModificationFormState>) => void;
  resetEnrollmentModification: () => void;
  
  // --- Auth (Signup Only) ---
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL') => void;
  setPersonalInfo: (info: SignupData['personalInfo']) => void;
  setAccountInfo: (info: SignupData['accountInfo']) => void;
  setAcademyInfo: (info: SignupData['academyInfo']) => void;
  setTerms: (terms: SignupData['terms']) => void;
  resetSignup: () => void;
  
  // --- Principal Create Class ---
  setPrincipalCreateClassStep: (step: PrincipalCreateClassStep) => void;
  setPrincipalClassFormData: (data: PrincipalClassFormData) => void;
  setPrincipalSelectedTeacherId: (teacherId: number | null) => void;
  resetPrincipalCreateClass: () => void;

  // [삭제됨] CreateClass (Legacy)
  // [삭제됨] PersonManagement
  // [삭제됨] PrincipalPersonManagement
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

  // 통합된 goBack
  const goBack = useCallback(async (): Promise<boolean> => {
    const isRoleDashboard = 
      pathname === '/dashboard/student' || 
      pathname === '/dashboard/teacher' || 
      pathname === '/dashboard/principal';
    
    if (isRoleDashboard) {
      return false;
    }
    
    router.back();
    return true;
  }, [router, pathname]);

  // 통합 폼 관리 메서드들
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
      if (window.history.state && window.history.state.preventForward) {
        window.history.pushState({ preventForward: true }, '', window.location.href);
      }
    };

    window.history.pushState({ preventForward: true }, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Capacitor 뒤로가기 처리
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeCapacitorBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const { Capacitor } = await import('@capacitor/core');

        if (!Capacitor.isNativePlatform()) return;

        const handleNativeBackButton = async () => {
          const isRoleDashboard = 
            pathname === '/dashboard/student' || 
            pathname === '/dashboard/teacher' || 
            pathname === '/dashboard/principal';
          
          const isMainDashboard = isRoleDashboard || pathname === '/dashboard';

          if (isRoleDashboard || isMainDashboard) {
            App.exitApp();
          } else {
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
        if (fn) fn();
      });
    };
  }, [router, pathname]);

  // 메모이제이션된 value 객체
  const contextValue = useMemo(() => ({
    navigation,
    forms,
    ui,
    session,
    goBack,
    updateForm,
    resetAllForms,
    getFormState,
    
    activeTab: navigation.activeTab,
    navigationItems: navigation.navigationItems,
    setActiveTab: navigation.setActiveTab,
    handleTabChange: navigation.handleTabChange,
    
    form: {
      enrollment: forms.enrollment,
      enrollmentModification: forms.enrollmentModification,
      auth: forms.auth,
      principalCreateClass: forms.principalCreateClass,
    },
    
    // --- Enrollment ---
    setEnrollmentStep: forms.setEnrollmentStep,
    setSelectedMonth: (month: number) => forms.setEnrollmentData({ selectedMonth: month }),
    setSelectedClasses: (classes: ClassesWithSessionsByMonthResponse[]) => forms.setEnrollmentData({ selectedClasses: classes }),
    setSelectedSessions: (sessions: ExtendedSessionData[]) => forms.setEnrollmentData({ selectedSessions: sessions }),
    setSelectedClassIds: (classIds: number[]) => forms.setEnrollmentData({ selectedClassIds: classIds }),
    setSelectedAcademyId: (academyId: number | null) => forms.setEnrollmentData({ selectedAcademyId: academyId }),
    setSelectedClassesWithSessions: (classes: ClassesWithSessionsByMonthResponse[]) => forms.setEnrollmentData({ selectedClassesWithSessions: classes }),
    resetEnrollment: forms.resetEnrollment,
    
    // --- Enrollment Modification ---
    setEnrollmentModificationStep: forms.setEnrollmentModificationStep,
    setEnrollmentModificationData: forms.setEnrollmentModificationData,
    resetEnrollmentModification: forms.resetEnrollmentModification,
    
    // --- Principal Create Class ---
    setPrincipalCreateClassStep: forms.setPrincipalCreateClassStep,
    setPrincipalClassFormData: (data: PrincipalClassFormData) => forms.setPrincipalCreateClassData({ classFormData: data }),
    setPrincipalSelectedTeacherId: (teacherId: number | null) => forms.setPrincipalCreateClassData({ selectedTeacherId: teacherId }),
    resetPrincipalCreateClass: forms.resetPrincipalCreateClass,
    
    // --- Auth (Signup Only) ---
    setSignupStep: forms.setAuthStep,
    setRole: (role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL') => forms.setAuthData({ signup: { ...forms.auth.signup, role } }),
    setPersonalInfo: (info: SignupData['personalInfo']) => forms.setAuthData({ signup: { ...forms.auth.signup, personalInfo: info } }),
    setAccountInfo: (info: SignupData['accountInfo']) => forms.setAuthData({ signup: { ...forms.auth.signup, accountInfo: info } }),
    setAcademyInfo: (info: SignupData['academyInfo']) => forms.setAuthData({ signup: { ...forms.auth.signup, academyInfo: info } }),
    setTerms: (terms: SignupData['terms']) => forms.setAuthData({ signup: { ...forms.auth.signup, terms: terms } }),
    resetSignup: forms.resetAuth,
    
  }), [
    navigation, forms, ui, session,
    updateForm, resetAllForms, getFormState,
    goBack
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
export const useAuthFormContext = () => useForms().forms.auth;
export const useUIContext = useUI;