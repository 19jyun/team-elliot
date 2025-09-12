'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  EnrollmentForm, 
  CreateClassForm, 
  PrincipalCreateClassForm,
  AuthForm, 
  PersonManagementForm,
  EnrollmentStep,
  CreateClassStep,
  SignupStep,
  PrincipalPersonManagementStep,
  AuthMode,
  ClassesWithSessionsByMonthResponse
} from './types';
import { EnrollmentStatus } from '@/types/api/common';

interface FormState {
  enrollment: EnrollmentForm;
  createClass: CreateClassForm;
  principalCreateClass: PrincipalCreateClassForm;
  auth: AuthForm;
  personManagement: PersonManagementForm;
  principalPersonManagement: PersonManagementForm;
}

interface FormContextType {
  // 폼 상태
  enrollment: EnrollmentForm;
  createClass: CreateClassForm;
  principalCreateClass: PrincipalCreateClassForm;
  auth: AuthForm;
  personManagement: PersonManagementForm;
  principalPersonManagement: PersonManagementForm;
  
  // 수강신청 관련 (기존 DashboardContext 기능)
  setEnrollmentStep: (step: EnrollmentStep) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedClasses: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  setSelectedSessions: (sessions: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    currentStudents: number;
    maxStudents: number;
    isEnrollable: boolean;
    isFull: boolean;
    isPastStartTime: boolean;
    isAlreadyEnrolled: boolean;
    studentEnrollmentStatus: EnrollmentStatus | null;
  }[]) => void;
  setSelectedClassIds: (classIds: number[]) => void;
  setSelectedAcademyId: (academyId: number | null) => void;
  setSelectedClassesWithSessions: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  resetEnrollment: () => void;
  
  // 클래스 생성 관련 (기존 DashboardContext 기능)
  setCreateClassStep: (step: CreateClassStep) => void;
  setClassFormData: (data: Partial<CreateClassForm['classFormData']>) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;
  resetCreateClass: () => void;
  
  // Principal 클래스 생성 관련 (기존 PrincipalContext 기능)
  setPrincipalCreateClass: (state: PrincipalCreateClassForm) => void;
  setPrincipalCreateClassStep: (step: CreateClassStep) => void;
  setPrincipalClassFormData: (data: Partial<PrincipalCreateClassForm['classFormData']>) => void;
  setPrincipalSelectedTeacherId: (teacherId: number | null) => void;
  resetPrincipalCreateClass: () => void;
  
  // 인증 관련 (기존 AuthContext 기능)
  setAuthMode: (mode: AuthMode) => void;
  setAuthSubPage: (page: string | null) => void;
  navigateToAuthSubPage: (page: string) => void;
  goBackFromAuth: () => void;
  clearAuthSubPage: () => void;
  goBack: () => void;
  setSignupStep: (step: SignupStep) => void;
  setRole: (role: 'STUDENT' | 'TEACHER') => void;
  setPersonalInfo: (info: { name: string; phoneNumber: string }) => void;
  setAccountInfo: (info: { userId: string; password: string; confirmPassword: string }) => void;
  setTerms: (terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => void;
  resetSignup: () => void;
  setLoginInfo: (info: { userId: string; password: string }) => void;
  resetLogin: () => void;
  
  // 인원 관리 관련 (기존 PrincipalContext 기능)
  setPersonManagementStep: (step: PrincipalPersonManagementStep) => void;
  setPersonManagementTab: (tab: 'enrollment' | 'refund') => void;
  setSelectedClassId: (classId: number | null) => void;
  setSelectedSessionId: (sessionId: number | null) => void;
  setSelectedRequestId: (requestId: number | null) => void;
  setSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => void;
  resetPersonManagement: () => void;
  
  // 통합 폼 관리
  updateForm: <T extends keyof FormState>(
    formType: T,
    updates: Partial<FormState[T]>
  ) => void;
  resetForm: (formType: keyof FormState) => void;
  resetAllForms: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// 초기 상태 생성 함수들
const getInitialEnrollmentForm = (): EnrollmentForm => ({
  currentStep: 'main',
  selectedMonth: null,
  selectedClasses: [],
  selectedSessions: [],
  selectedClassIds: [],
  selectedAcademyId: null,
  selectedClassesWithSessions: [],
});

const getInitialCreateClassForm = (): CreateClassForm => ({
  currentStep: 'info',
  classFormData: {
    name: '',
    description: '',
    level: '',
    maxStudents: 10,
    price: 0,
    academyId: undefined,
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
    },
    content: '',
  },
  selectedTeacherId: null,
});

const getInitialPrincipalCreateClassForm = (): PrincipalCreateClassForm => ({
  currentStep: 'info',
  classFormData: {
    name: '',
    description: '',
    maxStudents: 10,
    price: 0,
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      startDate: '',
      endDate: '',
    },
    content: '',
    academyId: undefined,
  },
  selectedTeacherId: null,
});

const getInitialAuthForm = (): AuthForm => ({
  authMode: 'login',
  authSubPage: null,
  signup: {
    currentStep: 'role-selection',
    role: null,
    personalInfo: { name: '', phoneNumber: '' },
    accountInfo: { userId: '', password: '', confirmPassword: '' },
    terms: { age: false, terms1: false, terms2: false, marketing: false },
  },
  login: { userId: '', password: '' },
});

const getInitialPersonManagementForm = (): PersonManagementForm => ({
  currentStep: 'class-list',
  selectedTab: 'enrollment',
  selectedClassId: null,
  selectedSessionId: null,
  selectedRequestId: null,
  selectedRequestType: null,
});

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FormState>({
    enrollment: getInitialEnrollmentForm(),
    createClass: getInitialCreateClassForm(),
    principalCreateClass: getInitialPrincipalCreateClassForm(),
    auth: getInitialAuthForm(),
    personManagement: getInitialPersonManagementForm(),
    principalPersonManagement: getInitialPersonManagementForm(),
  });

  // 수강신청 관련 메서드들 (기존 DashboardContext 기능)
  const setEnrollmentStep = useCallback((step: EnrollmentStep) => {
    setState(prev => ({
      ...prev,
      enrollment: { ...prev.enrollment, currentStep: step },
    }));
  }, []);

  const setSelectedMonth = useCallback((month: number) => {
    setState(prev => ({
      ...prev,
      enrollment: { ...prev.enrollment, selectedMonth: month },
    }));
  }, []);

  const setSelectedClasses = useCallback((classes: ClassesWithSessionsByMonthResponse[]) => {
    setState(prev => ({
      ...prev,
      enrollment: { ...prev.enrollment, selectedClasses: classes },
    }));
  }, []);

  const setSelectedSessions = useCallback((sessions: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    currentStudents: number;
    maxStudents: number;
    isEnrollable: boolean;
    isFull: boolean;
    isPastStartTime: boolean;
    isAlreadyEnrolled: boolean;
    studentEnrollmentStatus: EnrollmentStatus | null;
  }[]) => {
    setState(prev => ({
      ...prev,
      enrollment: { ...prev.enrollment, selectedSessions: sessions },
    }));
  }, []);

  const setSelectedClassIds = useCallback((classIds: number[]) => {
    setState(prev => ({
      ...prev,
      enrollment: { ...prev.enrollment, selectedClassIds: classIds },
    }));
  }, []);

  const setSelectedAcademyId = useCallback((academyId: number | null) => {
    setState(prev => ({
      ...prev,
      enrollment: { ...prev.enrollment, selectedAcademyId: academyId },
    }));
  }, []);

  const setSelectedClassesWithSessions = useCallback((classes: ClassesWithSessionsByMonthResponse[]) => {
    setState(prev => ({
      ...prev,
      enrollment: { ...prev.enrollment, selectedClassesWithSessions: classes },
    }));
  }, []);

  const resetEnrollment = useCallback(() => {
    setState(prev => ({
      ...prev,
      enrollment: getInitialEnrollmentForm(),
    }));
  }, []);

  // 클래스 생성 관련 메서드들 (기존 DashboardContext 기능)
  const setCreateClassStep = useCallback((step: CreateClassStep) => {
    setState(prev => ({
      ...prev,
      createClass: { ...prev.createClass, currentStep: step },
    }));
  }, []);

  const setClassFormData = useCallback((data: Partial<CreateClassForm['classFormData']>) => {
    setState(prev => ({
      ...prev,
      createClass: {
        ...prev.createClass,
        classFormData: { ...prev.createClass.classFormData, ...data },
      },
    }));
  }, []);

  const setSelectedTeacherId = useCallback((teacherId: number | null) => {
    setState(prev => ({
      ...prev,
      createClass: { ...prev.createClass, selectedTeacherId: teacherId },
    }));
  }, []);

  const resetCreateClass = useCallback(() => {
    setState(prev => ({
      ...prev,
      createClass: getInitialCreateClassForm(),
    }));
  }, []);

  // Principal 클래스 생성 관련 메서드들 (기존 PrincipalContext 기능)
  const setPrincipalCreateClass = useCallback((state: PrincipalCreateClassForm) => {
    setState(prev => ({
      ...prev,
      principalCreateClass: state,
    }));
  }, []);

  const setPrincipalCreateClassStep = useCallback((step: CreateClassStep) => {
    setState(prev => ({
      ...prev,
      principalCreateClass: { ...prev.principalCreateClass, currentStep: step },
    }));
  }, []);

  const setPrincipalClassFormData = useCallback((data: Partial<PrincipalCreateClassForm['classFormData']>) => {
    setState(prev => ({
      ...prev,
      principalCreateClass: {
        ...prev.principalCreateClass,
        classFormData: { ...prev.principalCreateClass.classFormData, ...data },
      },
    }));
  }, []);

  const setPrincipalSelectedTeacherId = useCallback((teacherId: number | null) => {
    setState(prev => ({
      ...prev,
      principalCreateClass: { ...prev.principalCreateClass, selectedTeacherId: teacherId },
    }));
  }, []);

  const resetPrincipalCreateClass = useCallback(() => {
    setState(prev => ({
      ...prev,
      principalCreateClass: getInitialPrincipalCreateClassForm(),
    }));
  }, []);

  // 인증 관련 메서드들 (기존 AuthContext 기능)
  const setAuthMode = useCallback((mode: AuthMode) => {
    setState(prev => ({
      ...prev,
      auth: { ...prev.auth, authMode: mode },
    }));
  }, []);

  const setAuthSubPage = useCallback((page: string | null) => {
    setState(prev => ({
      ...prev,
      auth: { ...prev.auth, authSubPage: page },
    }));
  }, []);

  const navigateToAuthSubPage = useCallback((page: string) => {
    setState(prev => ({
      ...prev,
      auth: { ...prev.auth, authSubPage: page },
    }));
  }, []);

  const goBackFromAuth = useCallback(() => {
    setState(prev => {
      const currentSubPage = prev.auth.authSubPage;
      let newSubPage: string | null = null;
      
      switch (currentSubPage) {
        case 'signup-terms':
          newSubPage = 'signup-account';
          break;
        case 'signup-account':
          newSubPage = 'signup-personal';
          break;
        case 'signup-personal':
          newSubPage = 'signup-role';
          break;
        case 'signup-role':
          newSubPage = null;
          break;
        default:
          newSubPage = null;
      }
      
      return {
        ...prev,
        auth: { ...prev.auth, authSubPage: newSubPage },
      };
    });
  }, []);

  const goBack = useCallback(() => {
    // 기본 goBack 구현 - 실제로는 NavigationContext에서 관리
    console.log('FormContext goBack called');
  }, []);

  const clearAuthSubPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      auth: { ...prev.auth, authSubPage: null },
    }));
  }, []);

  const setSignupStep = useCallback((step: SignupStep) => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        signup: { ...prev.auth.signup, currentStep: step },
      },
    }));
  }, []);

  const setRole = useCallback((role: 'STUDENT' | 'TEACHER') => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        signup: { ...prev.auth.signup, role },
      },
    }));
  }, []);

  const setPersonalInfo = useCallback((info: { name: string; phoneNumber: string }) => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        signup: { ...prev.auth.signup, personalInfo: info },
      },
    }));
  }, []);

  const setAccountInfo = useCallback((info: { userId: string; password: string; confirmPassword: string }) => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        signup: { ...prev.auth.signup, accountInfo: info },
      },
    }));
  }, []);

  const setTerms = useCallback((terms: { age: boolean; terms1: boolean; terms2: boolean; marketing: boolean }) => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        signup: { ...prev.auth.signup, terms },
      },
    }));
  }, []);

  const resetSignup = useCallback(() => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        signup: {
          currentStep: 'role-selection',
          role: null,
          personalInfo: { name: '', phoneNumber: '' },
          accountInfo: { userId: '', password: '', confirmPassword: '' },
          terms: { age: false, terms1: false, terms2: false, marketing: false },
        },
      },
    }));
  }, []);

  const setLoginInfo = useCallback((info: { userId: string; password: string }) => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        login: info,
      },
    }));
  }, []);

  const resetLogin = useCallback(() => {
    setState(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        login: { userId: '', password: '' },
      },
    }));
  }, []);

  // 인원 관리 관련 메서드들 (기존 PrincipalContext 기능)
  const setPersonManagementStep = useCallback((step: PrincipalPersonManagementStep) => {
    setState(prev => ({
      ...prev,
      personManagement: { ...prev.personManagement, currentStep: step },
    }));
  }, []);

  const setPersonManagementTab = useCallback((tab: 'enrollment' | 'refund') => {
    setState(prev => ({
      ...prev,
      personManagement: { ...prev.personManagement, selectedTab: tab },
    }));
  }, []);

  const setSelectedClassId = useCallback((classId: number | null) => {
    setState(prev => ({
      ...prev,
      personManagement: { ...prev.personManagement, selectedClassId: classId },
    }));
  }, []);

  const setSelectedSessionId = useCallback((sessionId: number | null) => {
    setState(prev => ({
      ...prev,
      personManagement: { ...prev.personManagement, selectedSessionId: sessionId },
    }));
  }, []);

  const setSelectedRequestId = useCallback((requestId: number | null) => {
    setState(prev => ({
      ...prev,
      personManagement: { ...prev.personManagement, selectedRequestId: requestId },
    }));
  }, []);

  const setSelectedRequestType = useCallback((requestType: 'enrollment' | 'refund' | null) => {
    setState(prev => ({
      ...prev,
      personManagement: { ...prev.personManagement, selectedRequestType: requestType },
    }));
  }, []);

  const resetPersonManagement = useCallback(() => {
    setState(prev => ({
      ...prev,
      personManagement: getInitialPersonManagementForm(),
    }));
  }, []);

  // 통합 폼 관리
  const updateForm = useCallback(<T extends keyof FormState>(
    formType: T,
    updates: Partial<FormState[T]>
  ) => {
    setState(prev => ({
      ...prev,
      [formType]: { ...prev[formType], ...updates },
    }));
  }, []);

  const resetForm = useCallback((formType: keyof FormState) => {
    const initialStates = {
      enrollment: getInitialEnrollmentForm(),
      createClass: getInitialCreateClassForm(),
      principalCreateClass: getInitialPrincipalCreateClassForm(),
      auth: getInitialAuthForm(),
      personManagement: getInitialPersonManagementForm(),
      principalPersonManagement: getInitialPersonManagementForm(),
    };
    
    setState(prev => ({
      ...prev,
      [formType]: initialStates[formType],
    }));
  }, []);

  const resetAllForms = useCallback(() => {
    setState({
      enrollment: getInitialEnrollmentForm(),
      createClass: getInitialCreateClassForm(),
      principalCreateClass: getInitialPrincipalCreateClassForm(),
      auth: getInitialAuthForm(),
      personManagement: getInitialPersonManagementForm(),
      principalPersonManagement: getInitialPersonManagementForm(),
    });
  }, []);

  const value: FormContextType = {
    enrollment: state.enrollment,
    createClass: state.createClass,
    principalCreateClass: state.principalCreateClass,
    auth: state.auth,
    personManagement: state.personManagement,
    principalPersonManagement: state.principalPersonManagement,
    setEnrollmentStep,
    setSelectedMonth,
    setSelectedClasses,
    setSelectedSessions,
    setSelectedClassIds,
    setSelectedAcademyId,
    setSelectedClassesWithSessions,
    resetEnrollment,
    setCreateClassStep,
    setClassFormData,
    setSelectedTeacherId,
    resetCreateClass,
    setPrincipalCreateClass,
    setPrincipalCreateClassStep,
    setPrincipalClassFormData,
    setPrincipalSelectedTeacherId,
    resetPrincipalCreateClass,
    setAuthMode,
    setAuthSubPage,
    navigateToAuthSubPage,
    goBackFromAuth,
    clearAuthSubPage,
    goBack,
    setSignupStep,
    setRole,
    setPersonalInfo,
    setAccountInfo,
    setTerms,
    resetSignup,
    setLoginInfo,
    resetLogin,
    setPersonManagementStep,
    setPersonManagementTab,
    setSelectedClassId,
    setSelectedSessionId,
    setSelectedRequestId,
    setSelectedRequestType,
    resetPersonManagement,
    updateForm,
    resetForm,
    resetAllForms,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}

// 기존 컨텍스트와 호환성을 위한 별칭들
export const useAuth = () => {
  const form = useForm();
  return {
    authMode: form.auth.authMode,
    authSubPage: form.auth.authSubPage,
    signup: form.auth.signup,
    login: form.auth.login,
    setAuthMode: form.setAuthMode,
    navigateToAuthSubPage: form.navigateToAuthSubPage,
    goBackFromAuth: form.goBackFromAuth,
    clearAuthSubPage: form.clearAuthSubPage,
    setSignupStep: form.setSignupStep,
    setRole: form.setRole,
    setPersonalInfo: form.setPersonalInfo,
    setAccountInfo: form.setAccountInfo,
    setTerms: form.setTerms,
    resetSignup: form.resetSignup,
    setLoginInfo: form.setLoginInfo,
    resetLogin: form.resetLogin,
  };
};

export const usePrincipalContext = () => {
  const form = useForm();
  return {
    activeTab: 0, // 기본값, 실제로는 NavigationContext에서 관리
    setActiveTab: () => {}, // 기본값, 실제로는 NavigationContext에서 관리
    createClass: form.principalCreateClass,
    setCreateClass: form.setPrincipalCreateClass,
    personManagement: form.personManagement,
    navigationItems: [], // 기본값, 실제로는 NavigationContext에서 관리
    handleTabChange: () => {}, // 기본값, 실제로는 NavigationContext에서 관리
    setPersonManagementStep: form.setPersonManagementStep,
    setPersonManagementTab: form.setPersonManagementTab,
    setSelectedClassId: form.setSelectedClassId,
    setSelectedSessionId: form.setSelectedSessionId,
    setSelectedRequestId: form.setSelectedRequestId,
    setSelectedRequestType: form.setSelectedRequestType,
    resetPersonManagement: form.resetPersonManagement,
    goBack: () => {}, // 기본값, 실제로는 NavigationContext에서 관리
  };
};

export const useStudentContext = () => {
  const form = useForm();
  return {
    activeTab: 0, // 기본값, 실제로는 NavigationContext에서 관리
    setActiveTab: () => {}, // 기본값, 실제로는 NavigationContext에서 관리
    enrollment: form.enrollment,
    setEnrollment: (enrollment: EnrollmentForm) => form.updateForm('enrollment', enrollment),
    navigationItems: [], // 기본값, 실제로는 NavigationContext에서 관리
    handleTabChange: () => {}, // 기본값, 실제로는 NavigationContext에서 관리
  };
};

export const useTeacherContext = () => {
  return {
    activeTab: 0, // 기본값, 실제로는 NavigationContext에서 관리
    setActiveTab: () => {}, // 기본값, 실제로는 NavigationContext에서 관리
    navigationItems: [], // 기본값, 실제로는 NavigationContext에서 관리
    handleTabChange: () => {}, // 기본값, 실제로는 NavigationContext에서 관리
  };
};
