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

interface DashboardState {
  activeTab: number;
  isTransitioning: boolean;
  subPage: string | null;
  enrollment: EnrollmentState;
}

interface DashboardContextType {
  navigationItems: NavigationItem[];
  activeTab: number;
  isTransitioning: boolean;
  subPage: string | null;
  enrollment: EnrollmentState;
  handleTabChange: (newTab: number) => void;
  navigateToSubPage: (page: string) => void;
  goBack: () => void;
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

      return {
        ...prev,
        isTransitioning: true,
        activeTab: newTab,
        // 탭 변경 시 SubPage 상태 초기화
        subPage: null,
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
    }));
  }, []);

  // 뒤로가기
  const goBack = useCallback(() => {
    setState(prev => {
      // 수강신청 중인 경우 단계별로 뒤로가기
      if (prev.enrollment.currentStep !== 'main') {
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
      
      // 메인 단계인 경우 SubPage에서 나가기
      return {
        ...prev,
        subPage: null,
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
    handleTabChange,
    navigateToSubPage,
    goBack,
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