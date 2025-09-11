'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { NavigationItem, NavigationHistoryItem, UserRole, STUDENT_NAVIGATION_ITEMS, TEACHER_NAVIGATION_ITEMS, PRINCIPAL_NAVIGATION_ITEMS } from './types';

interface NavigationState {
  activeTab: number;
  subPage: string | null;
  history: NavigationHistoryItem[];
  canGoBack: boolean;
  isTransitioning: boolean;
}

interface NavigationContextType {
  // 현재 상태
  activeTab: number;
  subPage: string | null;
  canGoBack: boolean;
  isTransitioning: boolean;
  history: NavigationHistoryItem[];
  
  // 네비게이션 아이템
  navigationItems: NavigationItem[];
  
  // 탭 관리
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  
  // 서브페이지 관리
  navigateToSubPage: (page: string) => void;
  clearSubPage: () => void;
  
  // 뒤로가기 관리
  goBack: () => void;
  pushHistory: (item: NavigationHistoryItem) => void;
  clearHistory: () => void;
  
  // 전환 상태 관리
  setTransitioning: (transitioning: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole || 'STUDENT';

  const [state, setState] = useState<NavigationState>({
    activeTab: 0,
    subPage: null,
    history: [],
    canGoBack: false,
    isTransitioning: false,
  });

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

  // 탭 변경 (기존 handleTabChange와 동일한 기능)
  const handleTabChange = useCallback((tab: number) => {
    setState(prev => ({
      ...prev,
      activeTab: tab,
      subPage: null,
      history: [],
      canGoBack: false,
      isTransitioning: true,
    }));
    
    // 전환 애니메이션 완료 후 상태 업데이트
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isTransitioning: false,
      }));
    }, 300);
  }, []);

  // 탭 설정 (기존 setActiveTab과 동일한 기능)
  const setActiveTab = useCallback((tab: number) => {
    setState(prev => ({
      ...prev,
      activeTab: tab,
    }));
  }, []);

  // 서브페이지 열기 (기존 navigateToSubPage와 동일한 기능)
  const navigateToSubPage = useCallback((page: string) => {
    setState(prev => ({
      ...prev,
      subPage: page,
      canGoBack: true,
    }));
  }, []);

  // 서브페이지 닫기 (기존 clearSubPage와 동일한 기능)
  const clearSubPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      subPage: null,
      canGoBack: prev.history.length > 0,
    }));
  }, []);

  // 뒤로가기 (기존 goBack과 동일한 기능)
  const goBack = useCallback(() => {
    if (state.subPage) {
      clearSubPage();
    } else if (state.history.length > 0) {
      const newHistory = [...state.history];
      const lastItem = newHistory.pop();
      
      if (lastItem && lastItem.onGoBack) {
        const success = lastItem.onGoBack();
        if (success) {
          setState(prev => ({
            ...prev,
            history: newHistory,
            canGoBack: newHistory.length > 0,
          }));
        }
      }
    }
  }, [state.subPage, state.history, clearSubPage]);

  // 히스토리 추가
  const pushHistory = useCallback((item: NavigationHistoryItem) => {
    setState(prev => ({
      ...prev,
      history: [...prev.history, item],
      canGoBack: true,
    }));
  }, []);

  // 히스토리 클리어
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
      canGoBack: false,
    }));
  }, []);

  // 전환 상태 설정
  const setTransitioning = useCallback((transitioning: boolean) => {
    setState(prev => ({
      ...prev,
      isTransitioning: transitioning,
    }));
  }, []);

  const value: NavigationContextType = {
    activeTab: state.activeTab,
    subPage: state.subPage,
    canGoBack: state.canGoBack,
    isTransitioning: state.isTransitioning,
    history: state.history,
    navigationItems: getNavigationItems(),
    setActiveTab,
    handleTabChange,
    navigateToSubPage,
    clearSubPage,
    goBack,
    pushHistory,
    clearHistory,
    setTransitioning,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

// 기존 DashboardContext와 호환성을 위한 별칭
export const useDashboardNavigation = useNavigation;
