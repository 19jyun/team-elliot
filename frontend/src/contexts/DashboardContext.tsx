'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ClassesWithSessionsByMonthResponse } from '@/types/api/class';
import { EnrollmentStatus } from '@/types/api/common';

interface NavigationItem {
  label: string;
  href: string;
  index: number;
}

// 수강신청 단계 타입
type EnrollmentStep = 'main' | 'academy-selection' | 'class-selection' | 'date-selection' | 'payment' | 'complete' | 'refund-request' | 'refund-complete';

// 수강신청 상태 인터페이스
interface EnrollmentState {
  currentStep: EnrollmentStep;
  selectedMonth: number | null;
  selectedClasses: ClassesWithSessionsByMonthResponse[];
  selectedSessions: {
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
  }[];
  selectedClassIds: number[];
  selectedAcademyId: number | null;
  selectedClassesWithSessions: ClassesWithSessionsByMonthResponse[];
}

// 강의 개설 단계 타입
type CreateClassStep = 'info' | 'teacher' | 'schedule' | 'content' | 'complete';

// 강의 개설 상태 인터페이스
interface CreateClassState {
  currentStep: CreateClassStep;
  classFormData: {
    name: string;
    description: string;
    level: string;
    maxStudents: number;
    price: number;
    academyId?: number;
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
      startDate?: string;
      endDate?: string;
    };
    content: string;
  };
  selectedTeacherId: number | null;
}

// 포커스 상태 타입
type FocusType = 'dashboard' | 'modal' | 'subpage' | 'overlay';

interface DashboardState {
  activeTab: number;
  isTransitioning: boolean;
  subPage: string | null;
  enrollment: EnrollmentState;
  createClass: CreateClassState;
  currentFocus: FocusType;
  focusHistory: FocusType[];
  isFocusTransitioning: boolean;
}

interface DashboardContextType {
  navigationItems: NavigationItem[];
  activeTab: number;
  isTransitioning: boolean;
  subPage: string | null;
  enrollment: EnrollmentState;
  createClass: CreateClassState;
  currentFocus: FocusType;
  focusHistory: FocusType[];
  isFocusTransitioning: boolean;
  handleTabChange: (tab: number) => void;
  navigateToSubPage: (page: string) => void;
  goBack: () => void;
  clearSubPage: () => void;
  // 포커스 관리 메서드들
  setFocus: (focus: FocusType) => void;
  pushFocus: (focus: FocusType) => void;
  popFocus: () => void;
  isDashboardFocused: () => boolean;
  isModalFocused: () => boolean;
  isSubPageFocused: () => boolean;
  isOverlayFocused: () => boolean;
  clearFocusHistory: () => void;
  // 수강신청 관련 메서드들
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
  // 수업 생성 관련 메서드들
  setCreateClassStep: (step: CreateClassStep) => void;
  setClassFormData: (data: Partial<{
    name: string;
    description: string;
    level: string;
    maxStudents: number;
    price: number;
    academyId?: number;
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
      startDate?: string;
      endDate?: string;
    };
    teacherId?: number;
    content?: string;
  }>) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;
  resetCreateClass: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {

  const [state, setState] = useState<DashboardState>({
    activeTab: 0,
    isTransitioning: false,
    subPage: null,
    enrollment: {
      currentStep: 'main',
      selectedMonth: null,
      selectedClasses: [],
      selectedSessions: [],
      selectedClassIds: [],
      selectedAcademyId: null,
      selectedClassesWithSessions: [],
    },
    createClass: {
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
    },
    currentFocus: 'dashboard',
    focusHistory: ['dashboard'],
    isFocusTransitioning: false,
  });

  // 사용자 역할에 따른 네비게이션 아이템 정의
  const getNavigationItems = useCallback((): NavigationItem[] => {
    return [
      { label: '클래스 정보', href: '/dashboard', index: 0 },
      { label: '수강신청', href: '/dashboard', index: 1 },
      { label: '나의 정보', href: '/dashboard', index: 2 },
    ];
  }, []);

  // 포커스 설정
  const setFocus = useCallback((focus: FocusType) => {
    setState(prev => ({
      ...prev,
      currentFocus: focus,
    }));
  }, []);

  // 대시보드가 포커스되어 있는지 확인
  const isDashboardFocused = useCallback(() => {
    return state.currentFocus === 'dashboard';
  }, [state.currentFocus]);

  // 모달이 포커스되어 있는지 확인
  const isModalFocused = useCallback(() => {
    return state.currentFocus === 'modal';
  }, [state.currentFocus]);

  // 서브페이지가 포커스되어 있는지 확인
  const isSubPageFocused = useCallback(() => {
    return state.currentFocus === 'subpage';
  }, [state.currentFocus]);

  // 오버레이가 포커스되어 있는지 확인
  const isOverlayFocused = useCallback(() => {
    return state.currentFocus === 'overlay';
  }, [state.currentFocus]);

  // 포커스 스택에 추가
  const pushFocus = useCallback((focus: FocusType) => {
    setState(prev => ({
      ...prev,
      currentFocus: focus,
      focusHistory: [...prev.focusHistory, focus],
      isFocusTransitioning: true,
    }));

    setTimeout(() => {
      setState(current => ({
        ...current,
        isFocusTransitioning: false,
      }));
    }, 100);
  }, []);

  // 포커스 스택에서 제거 (이전 포커스로 복원)
  const popFocus = useCallback(() => {
    setState(prev => {
      const newHistory = [...prev.focusHistory];
      newHistory.pop(); // 현재 포커스 제거
      const previousFocus = newHistory[newHistory.length - 1] || 'dashboard';

      return {
        ...prev,
        currentFocus: previousFocus,
        focusHistory: newHistory,
        isFocusTransitioning: true,
      };
    });

    setTimeout(() => {
      setState(current => ({
        ...current,
        isFocusTransitioning: false,
      }));
    }, 100);
  }, []);

  // 포커스 히스토리 초기화
  const clearFocusHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentFocus: 'dashboard',
      focusHistory: ['dashboard'],
      isFocusTransitioning: true,
    }));

    setTimeout(() => {
      setState(current => ({
        ...current,
        isFocusTransitioning: false,
      }));
    }, 100);
  }, []);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((newTab: number) => {
    if (newTab === state.activeTab || state.isTransitioning) return;

    setState(prev => {
      // 애니메이션 완료 후 전환 상태 해제
      setTimeout(() => {
        setState(current => ({
          ...current,
          isTransitioning: false,
        }));
      }, 300); // CSS transition 시간과 동일

      // 수강신청 탭에서 다른 탭으로 이동할 때 enrollment 관련 데이터 초기화
      if (prev.subPage === 'enroll') {
        localStorage.removeItem('refundPolicyAgreed');
        localStorage.removeItem('selectedSessions');
        localStorage.removeItem('selectedClasses');
        localStorage.removeItem('existingEnrollments');
        localStorage.removeItem('modificationChangeAmount');
        localStorage.removeItem('modificationChangeType');
        localStorage.removeItem('modificationNetChangeCount');
        localStorage.removeItem('modificationNewSessionsCount');
      }

      return {
        ...prev,
        isTransitioning: true,
        activeTab: newTab,
        // 탭 변경 시 SubPage 상태 초기화
        subPage: null,
        currentFocus: 'dashboard', // 탭 변경 시 대시보드로 포커스
        // 탭 변경 시 enrollment 상태 초기화
        enrollment: {
          currentStep: 'main',
          selectedMonth: null,
          selectedClasses: [],
          selectedSessions: [],
          selectedClassIds: [],
          selectedAcademyId: null,
          selectedClassesWithSessions: [],
        },
        // 탭 변경 시 createClass 상태 초기화
        createClass: {
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
        },

      };
    });
  }, [state.activeTab, state.isTransitioning]);

  // 서브 페이지 네비게이션
  const navigateToSubPage = useCallback((page: string) => {
    setState(prev => ({
      ...prev,
      subPage: page,
      // 수강신청 페이지의 경우 슬라이드 애니메이션을 허용하기 위해 dashboard 포커스 유지
      currentFocus: page === 'enroll' ? 'dashboard' : 'subpage',
    }));
  }, []);

  // 뒤로가기
  const goBack = useCallback(() => {
    setState(prev => {
      // 수강 변경 중인 경우 (modify-* 형태의 subPage) 단계별로 뒤로가기
      if (prev.subPage && prev.subPage.startsWith('modify-') && prev.enrollment.currentStep !== 'date-selection') {
        // 수강 변경은 2단계만 있음: date-selection -> payment
        const modificationStepOrder: EnrollmentStep[] = ['date-selection', 'payment'];
        const currentIndex = modificationStepOrder.indexOf(prev.enrollment.currentStep);
        const previousStep = currentIndex > 0 ? modificationStepOrder[currentIndex - 1] : 'date-selection';
        
        
        return {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            currentStep: previousStep,
          },
        };
      }
      
      // 수강신청 중인 경우 단계별로 뒤로가기
      if (prev.subPage === 'enroll' && prev.enrollment.currentStep !== 'academy-selection') {
        const stepOrder: EnrollmentStep[] = ['academy-selection', 'class-selection', 'date-selection', 'payment', 'complete'];
        const currentIndex = stepOrder.indexOf(prev.enrollment.currentStep);
        const previousStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : 'academy-selection';
        
        // class-selection에서 academy-selection으로 돌아갈 때 환불 동의 상태 초기화
        if (prev.enrollment.currentStep === 'class-selection' && previousStep === 'academy-selection') {
          localStorage.removeItem('refundPolicyAgreed');
        }
        
        return {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            currentStep: previousStep,
          },
        };
      }
      
      // 강의 개설 중인 경우 단계별로 뒤로가기
      if (prev.subPage === 'create-class' && prev.createClass.currentStep !== 'info') {
        const stepOrder: CreateClassStep[] = ['info', 'teacher', 'schedule', 'content', 'complete'];
        const currentIndex = stepOrder.indexOf(prev.createClass.currentStep);
        const previousStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : 'info';
        
        return {
          ...prev,
          createClass: {
            ...prev.createClass,
            currentStep: previousStep,
          },
        };
      }
      
      // 그 외의 경우 SubPage를 완전히 닫기
      // 수강신청 SubPage인 경우 refundPolicyAgreed 초기화
      if (prev.subPage === 'enroll') {
        localStorage.removeItem('refundPolicyAgreed');
        // enrollment 관련 localStorage 데이터도 모두 초기화
        localStorage.removeItem('selectedSessions');
        localStorage.removeItem('selectedClasses');
        localStorage.removeItem('existingEnrollments');
        localStorage.removeItem('modificationChangeAmount');
        localStorage.removeItem('modificationChangeType');
        localStorage.removeItem('modificationNetChangeCount');
        localStorage.removeItem('modificationNewSessionsCount');
      }
      
      return {
        ...prev,
        subPage: null,
        currentFocus: 'dashboard', // 서브페이지 닫을 때 대시보드로 포커스
        // SubPage가 닫힐 때 enrollment 상태도 초기화
        enrollment: {
          currentStep: 'main',
          selectedMonth: null,
          selectedClasses: [],
          selectedSessions: [],
          selectedClassIds: [],
          selectedAcademyId: null,
          selectedClassesWithSessions: [],
        },
        // SubPage가 닫힐 때 createClass 상태도 초기화
        createClass: {
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
        },
      };
    });
  }, []);

  // SubPage 초기화
  const clearSubPage = useCallback(() => {
    setState(prev => {
      // 수강신청 SubPage인 경우 관련 데이터 초기화
      if (prev.subPage === 'enroll') {
        localStorage.removeItem('refundPolicyAgreed');
        localStorage.removeItem('selectedSessions');
        localStorage.removeItem('selectedClasses');
        localStorage.removeItem('existingEnrollments');
        localStorage.removeItem('modificationChangeAmount');
        localStorage.removeItem('modificationChangeType');
        localStorage.removeItem('modificationNetChangeCount');
        localStorage.removeItem('modificationNewSessionsCount');
      }
      
      return {
        ...prev,
        subPage: null,
        currentFocus: 'dashboard',
      };
    });
  }, []);

  // 수강신청 단계 설정
  const setEnrollmentStep = useCallback((step: EnrollmentStep) => {
    setState(prev => ({
      ...prev,
      enrollment: {
        ...prev.enrollment,
        currentStep: step,
      },
    }));
  }, []);

  // 선택된 월 설정
  const setSelectedMonth = useCallback((month: number) => {
    setState(prev => ({
      ...prev,
      enrollment: {
        ...prev.enrollment,
        selectedMonth: month,
      },
    }));
  }, []);

  // 선택된 클래스들 설정
  const setSelectedClasses = useCallback((classes: ClassesWithSessionsByMonthResponse[]) => {
    setState(prev => ({
      ...prev,
      enrollment: {
        ...prev.enrollment,
        selectedClasses: classes,
      },
    }));
  }, []);

  // 선택된 세션들 설정
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
      enrollment: {
        ...prev.enrollment,
        selectedSessions: sessions,
      },
    }));
  }, []);

  // 선택된 클래스 ID들 설정
  const setSelectedClassIds = useCallback((ids: number[]) => {
    setState(prev => ({
      ...prev,
      enrollment: {
        ...prev.enrollment,
        selectedClassIds: ids,
      },
    }));
  }, []);

  // 선택된 학원 ID 설정
  const setSelectedAcademyId = useCallback((academyId: number | null) => {
    setState(prev => ({
      ...prev,
      enrollment: {
        ...prev.enrollment,
        selectedAcademyId: academyId,
      },
    }));
  }, []);

  // 선택된 클래스 및 세션 데이터 설정
  const setSelectedClassesWithSessions = useCallback((classes: ClassesWithSessionsByMonthResponse[]) => {
    setState(prev => ({
      ...prev,
      enrollment: {
        ...prev.enrollment,
        selectedClassesWithSessions: classes,
      },
    }));
  }, []);

  // 수강신청 상태 초기화
  const resetEnrollment = useCallback(() => {
    setState(prev => ({
      ...prev,
      enrollment: {
        currentStep: 'main',
        selectedMonth: null,
        selectedClasses: [],
        selectedSessions: [],
        selectedClassIds: [],
        selectedAcademyId: null,
        selectedClassesWithSessions: [],
      },
    }));
  }, []);

  // 강의 개설 단계 설정
  const setCreateClassStep = useCallback((step: CreateClassStep) => {
    setState(prev => ({
      ...prev,
      createClass: {
        ...prev.createClass,
        currentStep: step,
      },
    }));
  }, []);

  // 강의 폼 데이터 설정
  const setClassFormData = useCallback((data: Partial<CreateClassState['classFormData']>) => {
    setState(prev => ({
      ...prev,
      createClass: {
        ...prev.createClass,
        classFormData: {
          ...prev.createClass.classFormData,
          ...data,
        },
      },
    }));
  }, []);

  // 선택된 선생님 ID 설정
  const setSelectedTeacherId = useCallback((teacherId: number | null) => {
    setState(prev => ({
      ...prev,
      createClass: {
        ...prev.createClass,
        selectedTeacherId: teacherId,
      },
    }));
  }, []);

  // 강의 개설 상태 초기화
  const resetCreateClass = useCallback(() => {
    setState(prev => ({
      ...prev,
      createClass: {
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
      },
    }));
  }, []);


  const value: DashboardContextType = {
    navigationItems: getNavigationItems(),
    activeTab: state.activeTab,
    isTransitioning: state.isTransitioning,
    subPage: state.subPage,
    enrollment: state.enrollment,
    createClass: state.createClass,

    currentFocus: state.currentFocus,
    focusHistory: state.focusHistory,
    isFocusTransitioning: state.isFocusTransitioning,
    handleTabChange,
    navigateToSubPage,
    goBack,
    clearSubPage,
    setFocus,
    pushFocus,
    popFocus,
    isDashboardFocused,
    isModalFocused,
    isSubPageFocused,
    isOverlayFocused,
    clearFocusHistory,
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

  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardNavigation() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardNavigation must be used within a DashboardProvider');
  }
  return context;
} 