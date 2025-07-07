'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface NavigationItem {
  label: string;
  href: string;
  index: number;
}

// 수강신청 단계 타입
export type EnrollmentStep = 'main' | 'class-selection' | 'date-selection' | 'payment' | 'complete';

// 수강신청 상태 인터페이스
export interface EnrollmentState {
  currentStep: EnrollmentStep;
  selectedMonth: number | null;
  selectedClasses: any[];
  selectedSessions: any[];
  selectedClassIds: number[];
}

// 포커스 상태 타입
export type FocusType = 'dashboard' | 'modal' | 'subpage' | 'overlay';

interface DashboardState {
  activeTab: number;
  isTransitioning: boolean;
  subPage: string | null;
  enrollment: EnrollmentState;
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
  currentFocus: FocusType;
  focusHistory: FocusType[];
  isFocusTransitioning: boolean;
  handleTabChange: (newTab: number) => void;
  navigateToSubPage: (page: string) => void;
  goBack: () => void;
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
  setSelectedClasses: (classes: any[]) => void;
  setSelectedSessions: (sessions: any[]) => void;
  setSelectedClassIds: (ids: number[]) => void;
  resetEnrollment: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
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
    },
    currentFocus: 'dashboard',
    focusHistory: ['dashboard'],
    isFocusTransitioning: false,
  });

  // 사용자 역할에 따른 네비게이션 아이템 정의
  const getNavigationItems = useCallback((): NavigationItem[] => {
    if (!session?.user) return [];

    const userRole = session.user.role || 'STUDENT';

    switch (userRole) {
      case 'STUDENT':
        return [
          { label: '클래스 정보', href: '/dashboard/student', index: 0 },
          { label: '수강신청', href: '/dashboard/student/enroll', index: 1 },
          { label: '나의 정보', href: '/dashboard/student/profile', index: 2 },
        ];
      case 'TEACHER':
        return [
          { label: '내 수업', href: '/dashboard/teacher', index: 0 },
          { label: '수강생 관리', href: '/dashboard/teacher/students', index: 1 },
          { label: '나의 정보', href: '/dashboard/teacher/profile', index: 2 },
        ];
      case 'ADMIN':
        return [
          { label: '수강생 관리', href: '/dashboard/admin/students', index: 0 },
          { label: '선생님 관리', href: '/dashboard/admin/teachers', index: 1 },
          { label: '수업 관리', href: '/dashboard/admin/classes', index: 2 },
        ];
      default:
        return [];
    }
  }, [session?.user]);

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

      // 수강신청 탭에서 다른 탭으로 이동할 때 refundPolicyAgreed 초기화
      if (prev.subPage === 'enroll') {
        localStorage.removeItem('refundPolicyAgreed');
      }

      return {
        ...prev,
        isTransitioning: true,
        activeTab: newTab,
        // 탭 변경 시 SubPage 상태 초기화
        subPage: null,
        currentFocus: 'dashboard', // 탭 변경 시 대시보드로 포커스
        enrollment: {
          currentStep: 'main',
          selectedMonth: null,
          selectedClasses: [],
          selectedSessions: [],
          selectedClassIds: [],
        },
      };
    });
  }, [state.activeTab, state.isTransitioning]);

  // 서브 페이지 네비게이션
  const navigateToSubPage = useCallback((page: string) => {
    setState(prev => ({
      ...prev,
      subPage: page,
      currentFocus: 'subpage', // 서브페이지로 이동 시 포커스 변경
    }));
  }, []);

  // 뒤로가기
  const goBack = useCallback(() => {
    setState(prev => {
      // 수강신청 중인 경우 단계별로 뒤로가기
      if (prev.subPage === 'enroll' && prev.enrollment.currentStep !== 'main') {
        const stepOrder: EnrollmentStep[] = ['main', 'class-selection', 'date-selection', 'payment', 'complete'];
        const currentIndex = stepOrder.indexOf(prev.enrollment.currentStep);
        const previousStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : 'main';
        
        return {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            currentStep: previousStep,
          },
        };
      }
      
      // 그 외의 경우 SubPage를 완전히 닫기
      // 수강신청 SubPage인 경우 refundPolicyAgreed 초기화
      if (prev.subPage === 'enroll') {
        localStorage.removeItem('refundPolicyAgreed');
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
        },
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
  const setSelectedClasses = useCallback((classes: any[]) => {
    setState(prev => ({
      ...prev,
      enrollment: {
        ...prev.enrollment,
        selectedClasses: classes,
      },
    }));
  }, []);

  // 선택된 세션들 설정
  const setSelectedSessions = useCallback((sessions: any[]) => {
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
      },
    }));
  }, []);

  const value: DashboardContextType = {
    navigationItems: getNavigationItems(),
    activeTab: state.activeTab,
    isTransitioning: state.isTransitioning,
    subPage: state.subPage,
    enrollment: state.enrollment,
    currentFocus: state.currentFocus,
    focusHistory: state.focusHistory,
    isFocusTransitioning: state.isFocusTransitioning,
    handleTabChange,
    navigateToSubPage,
    goBack,
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
    resetEnrollment,
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