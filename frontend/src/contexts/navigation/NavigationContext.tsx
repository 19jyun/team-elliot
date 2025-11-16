// src/contexts/navigation/NavigationContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { NavigationItem } from '../types/NavigationTypes';
import { ensureTrailingSlash } from '@/lib/utils/router';

export const STUDENT_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "클래스 정보", href: "/dashboard/student", index: 0 },
  { label: "수강신청", href: "/dashboard/student", index: 1 },
  { label: "나의 정보", href: "/dashboard/student", index: 2 },
];

export const TEACHER_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "내 수업", href: "/dashboard/teacher", index: 0 },
  { label: "수업 관리", href: "/dashboard/teacher", index: 1 },
  { label: "나의 정보", href: "/dashboard/teacher", index: 2 },
];

export const PRINCIPAL_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "수업", href: "/dashboard/principal", index: 0 },
  { label: "신청 관리", href: "/dashboard/principal", index: 1 },
  { label: "인원 관리", href: "/dashboard/principal", index: 2 },
  { label: "프로필", href: "/dashboard/principal", index: 3 },
];

interface NavigationContextType {
  // 상태
  activeTab: number;
  
  // 네비게이션 아이템
  navigationItems: NavigationItem[];
  
  // 네비게이션
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  
  // 권한 확인
  canAccessTab: (tabIndex: number) => boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within an NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'STUDENT';
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTabState] = useState(0);

  // 역할별 네비게이션 아이템 가져오기
  const getNavigationItems = useCallback((): NavigationItem[] => {
    switch (userRole) {
      case 'STUDENT':
        return STUDENT_NAVIGATION_ITEMS;
      case 'TEACHER':
        return TEACHER_NAVIGATION_ITEMS;
      case 'PRINCIPAL':
        return PRINCIPAL_NAVIGATION_ITEMS;
      default:
        return STUDENT_NAVIGATION_ITEMS;
    }
  }, [userRole]);

  // 역할별 네비게이션 권한 확인
  const canAccessTab = useCallback((tabIndex: number): boolean => {
    const items = getNavigationItems();
    return tabIndex >= 0 && tabIndex < items.length;
  }, [getNavigationItems]);

  const navigationItems = getNavigationItems();

  // 탭 변경 시 해당 역할의 메인 대시보드 페이지로 이동
  const setActiveTab = useCallback((tab: number) => {
    setActiveTabState(tab);
    
    // 역할에 따라 메인 대시보드로 이동
    const rolePath = userRole.toLowerCase();
    router.push(ensureTrailingSlash(`/dashboard/${rolePath}`));
  }, [router, userRole]);

  const handleTabChange = useCallback((tab: number) => {
    if (tab === activeTab) return;
    
    // 권한 확인
    if (!canAccessTab(tab)) {
      console.warn(`User with role ${userRole} cannot access tab ${tab}`);
      return;
    }
    
    setActiveTab(tab);
  }, [activeTab, canAccessTab, userRole, setActiveTab]);

  // URL 기반으로 activeTab 동기화
  React.useEffect(() => {
    // 현재 경로가 역할별 메인 대시보드인 경우에만 탭 동기화
    const rolePath = userRole.toLowerCase();
    const mainDashboardPath = `/dashboard/${rolePath}`;
    
    if (pathname === mainDashboardPath) {
      // URL이 메인 대시보드인 경우, 현재 activeTab 유지
      // (탭 변경은 handleTabChange에서 처리)
    }
  }, [pathname, userRole]);

  const value: NavigationContextType = useMemo(() => ({
    activeTab,
    navigationItems,
    setActiveTab,
    handleTabChange,
    canAccessTab,
  }), [activeTab, navigationItems, setActiveTab, handleTabChange, canAccessTab]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
