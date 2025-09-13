// src/contexts/navigation/ImprovedNavigationContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { VirtualHistoryManager } from './index';
import { ImprovedGoBackManager } from './ImprovedGoBackManager';
import { contextEventBus } from '../events/ContextEventBus';
import { NavigationItem, NavigationHistoryItem } from '../types/NavigationTypes';
import { useStateSync } from '../state/StateSyncContext';
import { NavigationState, FormsState } from '../state/StateSyncTypes';

export const STUDENT_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "클래스 정보", href: "/dashboard", index: 0 },
  { label: "수강신청", href: "/dashboard", index: 1 },
  { label: "나의 정보", href: "/dashboard", index: 2 },
];

export const TEACHER_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "내 수업", href: "/dashboard", index: 0 },
  { label: "수업 관리", href: "/dashboard", index: 1 },
  { label: "나의 정보", href: "/dashboard", index: 2 },
];

export const PRINCIPAL_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "강의 관리", href: "/dashboard", index: 0 },
  { label: "수강생/강사 관리", href: "/dashboard", index: 1 },
  { label: "학원 관리", href: "/dashboard", index: 2 },
  { label: "나의 정보", href: "/dashboard", index: 3 },
];

interface ImprovedNavigationContextType {
  // 상태
  activeTab: number;
  subPage: string | null;
  canGoBack: boolean;
  isTransitioning: boolean;
  
  // 네비게이션 아이템
  navigationItems: NavigationItem[];
  
  // 히스토리
  history: NavigationHistoryItem[];
  
  // 네비게이션
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  navigateToSubPage: (page: string) => void;
  clearSubPage: () => void;
  
  // 통합된 goBack (ImprovedGoBackManager 사용)
  goBack: () => Promise<boolean>;
  goBackWithForms: (formsState: FormsState) => Promise<boolean>;
  
  // 히스토리 관리
  pushHistory: (item: NavigationHistoryItem) => void;
  clearHistory: () => void;
  
  // 권한 확인
  canAccessTab: (tabIndex: number) => boolean;
  canAccessSubPage: (page: string) => boolean;
}

const ImprovedNavigationContext = createContext<ImprovedNavigationContextType | undefined>(undefined);

export const useImprovedNavigation = (): ImprovedNavigationContextType => {
  const context = useContext(ImprovedNavigationContext);
  if (!context) {
    throw new Error('useImprovedNavigation must be used within an ImprovedNavigationProvider');
  }
  return context;
};

interface ImprovedNavigationProviderProps {
  children: ReactNode;
  formsState?: FormsState;
}

export const ImprovedNavigationProvider: React.FC<ImprovedNavigationProviderProps> = ({ children, formsState }) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'STUDENT';
  const stateSync = useStateSync();
  
  const [virtualHistory] = useState(() => new VirtualHistoryManager());
  const [goBackManager] = useState(() => new ImprovedGoBackManager(virtualHistory, contextEventBus, stateSync));
  
  const [activeTab, setActiveTabState] = useState(0);
  const [subPage, setSubPageState] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);

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

  // 역할별 서브페이지 접근 권한 확인
  const canAccessSubPage = useCallback((page: string): boolean => {
    switch (userRole) {
      case 'STUDENT':
        return [
          'enroll',
          'enrolled-classes', 
          'academy',
          'personal-info',
          'enrollment-history',
          'cancellation-history'
        ].includes(page) || page.startsWith('modify-');
      case 'TEACHER':
        return [
          'my-classes', 
          'class-management', 
          'my-info',
          'profile',
          'personal-info',
          'academy-management',
          'teacher-classes'
        ].includes(page);
      case 'PRINCIPAL':
        return [
          'class-management', 
          'person-management', 
          'academy-management', 
          'my-info', 
          'create-class',
          'profile',
          'personal-info',
          'bank-info',
          'enrollment-refund-management',
          'teacher-student-management'
        ].includes(page);
      default:
        return false;
    }
  }, [userRole]);

  const navigationItems = getNavigationItems();

  // 가상 히스토리 상태 구독
  useEffect(() => {
    const unsubscribe = virtualHistory.subscribe((historyState) => {
      setCanGoBack(historyState.currentIndex > 0);
      
      // 가상 히스토리를 실제 history로 변환
      const historyItems: NavigationHistoryItem[] = historyState.entries.map((entry, index) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        type: entry.type as 'navigation' | 'subpage' | 'form-step',
        name: entry.data.title || `${entry.type} ${index + 1}`,
        data: entry.data,
        canGoBack: index > 0,
        onGoBack: () => {
          if (index > 0) {
            virtualHistory.goBack();
            return true;
          }
          return false;
        },
      }));
      
      setHistory(historyItems);
    });

    return unsubscribe;
  }, [virtualHistory]);

  // 초기 상태를 StateSync에 발행 (한 번만 실행)
  useEffect(() => {
    const navigationState: NavigationState = {
      activeTab,
      subPage,
      canGoBack,
      isTransitioning,
      navigationItems: getNavigationItems(),
      history: history,
    };
    
    stateSync.publish('navigation', navigationState);
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 상태 변경 시 StateSync에 발행
  useEffect(() => {
    const navigationState: NavigationState = {
      activeTab,
      subPage,
      canGoBack,
      isTransitioning,
      navigationItems: getNavigationItems(),
      history: history,
    };
    
    stateSync.publish('navigation', navigationState);
  }, [activeTab, subPage, canGoBack, isTransitioning]);

  // 이벤트 버스 구독
  useEffect(() => {
    const unsubscribe = contextEventBus.subscribe('formStateChanged', (data) => {
      // 폼 상태 변경 시 히스토리에 추가
      virtualHistory.push({
        type: 'form-step',
        data: {
          formType: data.formType,
          formStep: data.step,
          title: `${data.formType} - ${data.step}`,
          description: `Form step changed to ${data.step}`,
        },
      });
    });

    return unsubscribe;
  }, [virtualHistory]);

  // 네비게이션 메서드들
  const setActiveTab = useCallback((tab: number) => {
    setActiveTabState(tab);
    setSubPageState(null);
    
    // StateSync에 상태 발행
    const navigationState: NavigationState = {
      activeTab: tab,
      subPage: null,
      canGoBack: virtualHistory.getState().currentIndex > 0,
      isTransitioning: false,
      navigationItems: getNavigationItems(),
      history: history,
    };
    stateSync.publish('navigation', navigationState);
    
    // 히스토리에 추가
    virtualHistory.push({
      type: 'navigation',
      data: {
        activeTab: tab,
        subPage: null,
        title: `Tab ${tab}`,
        description: `Switched to tab ${tab}`,
      },
    });

    // 이벤트 발생
    contextEventBus.emit('navigationChanged', {
      subPage: null,
      activeTab: tab,
    });
  }, [virtualHistory, getNavigationItems, history, stateSync]);

  const handleTabChange = useCallback((tab: number) => {
    if (tab === activeTab) return;
    
    // 권한 확인
    if (!canAccessTab(tab)) {
      console.warn(`User with role ${userRole} cannot access tab ${tab}`);
      return;
    }
    
    setActiveTab(tab);
  }, [activeTab, canAccessTab, userRole, setActiveTab]);

  const navigateToSubPage = useCallback((page: string) => {
    // 권한 확인
    if (!canAccessSubPage(page)) {
      console.warn(`User with role ${userRole} cannot access subpage ${page}`);
      return;
    }
    
    setSubPageState(page);
    
    // StateSync에 상태 발행
    const navigationState: NavigationState = {
      activeTab,
      subPage: page,
      canGoBack: virtualHistory.getState().currentIndex > 0,
      isTransitioning: false,
      navigationItems: getNavigationItems(),
      history: history,
    };
    stateSync.publish('navigation', navigationState);
    
    // 히스토리에 추가
    virtualHistory.push({
      type: 'subpage',
      data: {
        activeTab,
        subPage: page,
        title: `Subpage: ${page}`,
        description: `Opened subpage ${page}`,
      },
    });

    // 이벤트 발생
    contextEventBus.emit('navigationChanged', {
      subPage: page,
      activeTab,
    });
  }, [activeTab, canAccessSubPage, userRole, virtualHistory, getNavigationItems, history, stateSync]);

  const clearSubPage = useCallback(() => {
    setSubPageState(null);
    
    // StateSync에 상태 발행
    const navigationState: NavigationState = {
      activeTab,
      subPage: null,
      canGoBack: virtualHistory.getState().currentIndex > 0,
      isTransitioning: false,
      navigationItems: getNavigationItems(),
      history: history,
    };
    stateSync.publish('navigation', navigationState);
    
    // 이벤트 발생
    contextEventBus.emit('navigationChanged', {
      subPage: null,
      activeTab,
    });
  }, [activeTab, virtualHistory, getNavigationItems, history, stateSync]);

  const goBackWithForms = useCallback(async (formsState: FormsState): Promise<boolean> => {
    setIsTransitioning(true);
    
    try {
      // StateSync를 거치지 않고 직접 상태를 전달
      const navigationState: NavigationState = {
        activeTab,
        subPage,
        canGoBack,
        isTransitioning,
        navigationItems: getNavigationItems(),
        history: history,
      };
      
      // formsState가 전달되지 않은 경우 기본값 사용
      if (!formsState) {
           if (subPage) {
            clearSubPage();
            return true;
           }
           return false;
      }
      
      const result = await goBackManager.executeGoBackWithState(navigationState, formsState);
      
      if (result.success) {
        // 결과에 따라 상태 업데이트
        switch (result.action) {
          case "history-back":
            // 가상 히스토리에서 이미 처리됨
            break;
          case "step-back":
            // 폼 단계 뒤로가기는 ImprovedGoBackManager에서 이미 처리됨
            // 여기서는 추가적인 특수 처리만 수행
            break;
          case "close":
            // subPage 닫기
            if (result.data?.subPage === null) {
              clearSubPage();
            }
            break;
          case "navigate":
            // 탭 변경
            if (result.data?.activeTab !== undefined) {
              setActiveTabState(result.data.activeTab);
            }
            break;
        }

        // 특수 처리
        if (result.data?.clearRefundPolicy) {
          localStorage.removeItem('refundPolicyAgreed');
        }
        if (result.data?.clearRequestSelection) {
          // principalPersonManagement?.setSelectedRequestId(null);
          // principalPersonManagement?.setSelectedRequestType(null);
        }
        if (result.data?.clearSessionSelection) {
          // principalPersonManagement?.setSelectedSessionId(null);
        }
      }

      return result.success;
    } catch (error) {
      console.error('Navigation goBack error:', error);
      return false;
    } finally {
      setIsTransitioning(false);
    }
  }, [goBackManager, stateSync, clearSubPage]);

  const goBack = useCallback(async (): Promise<boolean> => {
    // formsState가 없으면 기본 뒤로가기 로직 사용
    if (!formsState) {
      if (subPage) {
        clearSubPage();
        return true;
      }
      return false;
    }
    return await goBackWithForms(formsState);
  }, [goBackWithForms, formsState, subPage, clearSubPage]);

  const pushHistory = useCallback((item: NavigationHistoryItem) => {
    virtualHistory.push({
      type: item.type,
      data: item.data,
    });
  }, [virtualHistory]);

  const clearHistory = useCallback(() => {
    virtualHistory.clear();
  }, [virtualHistory]);

  // 네이티브 앱 뒤로가기 버튼 처리 (고급 시스템)
  useEffect(() => {
    const handleNativeBackButton = async () => {
      const success = await goBack();
      
      // 뒤로갈 수 없으면 앱 종료
      if (!success) {
        if (typeof window !== 'undefined' && 'App' in window) {
          const { App } = window as { 
            App: { 
              addListener: (event: string, callback: () => void) => void;
              removeListener: (event: string, callback: () => void) => void;
              exitApp: () => void;
            } 
          };
          App.exitApp();
        }
      }
    };

    // Capacitor 네이티브 앱 뒤로가기 버튼 리스너
    if (typeof window !== 'undefined' && 'App' in window) {
      const { App } = window as { 
        App: { 
          addListener: (event: string, callback: () => void) => void;
          removeListener: (event: string, callback: () => void) => void;
          exitApp: () => void;
        } 
      };
      App.addListener('backButton', handleNativeBackButton);
      
      return () => {
        App.removeListener('backButton', handleNativeBackButton);
      };
    }
  }, [goBack]);

  // 브라우저 뒤로가기 처리는 ImprovedAppContext에서 담당

  const value: ImprovedNavigationContextType = {
    activeTab,
    subPage,
    canGoBack,
    isTransitioning,
    navigationItems,
    history,
    setActiveTab,
    handleTabChange,
    navigateToSubPage,
    clearSubPage,
    goBack,
    goBackWithForms,
    pushHistory,
    clearHistory,
    canAccessTab,
    canAccessSubPage,
  };

  return (
    <ImprovedNavigationContext.Provider value={value}>
      {children}
    </ImprovedNavigationContext.Provider>
  );
};
