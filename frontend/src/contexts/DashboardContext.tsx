'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface NavigationItem {
  label: string;
  href: string;
  index: number;
}

interface DashboardState {
  activeTab: number;
  isTransitioning: boolean;
}

interface DashboardContextType {
  navigationItems: NavigationItem[];
  activeTab: number;
  isTransitioning: boolean;
  handleTabChange: (newTab: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [state, setState] = useState<DashboardState>({
    activeTab: 0,
    isTransitioning: false,
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
      };
    });
  }, [state.activeTab, state.isTransitioning]);

  const value: DashboardContextType = {
    navigationItems: getNavigationItems(),
    activeTab: state.activeTab,
    isTransitioning: state.isTransitioning,
    handleTabChange,
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