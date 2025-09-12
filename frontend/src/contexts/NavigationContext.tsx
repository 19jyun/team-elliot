// src/contexts/NavigationContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { VirtualHistoryManager, GoBackManager, GoBackContext, GoBackResult } from './navigation';
import { contextEventBus } from './events/ContextEventBus';

interface NavigationHistoryItem {
  id: string;
  timestamp: number;
  type: 'navigation' | 'subpage' | 'form-step';
  data: {
    activeTab?: number;
    subPage?: string | null;
    formType?: string;
    formStep?: string;
    title?: string;
    description?: string;
  };
}

interface NavigationContextType {
  // 상태
  activeTab: number;
  subPage: string | null;
  canGoBack: boolean;
  isTransitioning: boolean;
  
  // 네비게이션
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  navigateToSubPage: (page: string) => void;
  clearSubPage: () => void;
  
  // 통합된 goBack (VirtualHistoryManager + GoBackManager 사용)
  goBack: () => Promise<boolean>;
  
  // 히스토리 관리
  pushHistory: (item: NavigationHistoryItem) => void;
  clearHistory: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [virtualHistory] = useState(() => new VirtualHistoryManager());
  const [goBackManager] = useState(() => new GoBackManager(virtualHistory, contextEventBus));
  
  const [activeTab, setActiveTabState] = useState(0);
  const [subPage, setSubPageState] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 가상 히스토리 상태 구독
  useEffect(() => {
    const unsubscribe = virtualHistory.subscribe((historyState) => {
      setCanGoBack(historyState.currentIndex > 0);
    });

    return unsubscribe;
  }, [virtualHistory]);

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
  }, [virtualHistory]);

  const handleTabChange = useCallback((tab: number) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [activeTab, setActiveTab]);

  const navigateToSubPage = useCallback((page: string) => {
    setSubPageState(page);
    
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
  }, [activeTab, virtualHistory]);

  const clearSubPage = useCallback(() => {
    setSubPageState(null);
    
    // 이벤트 발생
    contextEventBus.emit('navigationChanged', {
      subPage: null,
      activeTab,
    });
  }, [activeTab]);

  const goBack = useCallback(async (): Promise<boolean> => {
    setIsTransitioning(true);
    
    try {
      // GoBackContext 구성 (실제 구현에서는 다른 Context에서 가져와야 함)
      const context: GoBackContext = {
        subPage,
        activeTab,
        formStates: {
          // 실제 구현에서는 각 FormContext에서 가져와야 함
          enrollment: { currentStep: 'academy-selection' },
          createClass: { currentStep: 'info' },
          auth: { currentStep: 'signup-role' },
          personManagement: { currentStep: 'class-list' },
        },
      };

      const result: GoBackResult = await goBackManager.executeGoBack(context);
      
      if (result.success) {
        if (result.action === 'subpage-closed') {
          clearSubPage();
        } else if (result.action === 'step-reverted') {
          // 가상 히스토리에서 상태 복원
          const currentEntry = virtualHistory.getCurrentEntry();
          if (currentEntry) {
            if (currentEntry.data.activeTab !== undefined) {
              setActiveTabState(currentEntry.data.activeTab);
            }
            if (currentEntry.data.subPage !== undefined) {
              setSubPageState(currentEntry.data.subPage);
            }
          }
        }
      }

      return result.success;
    } catch (error) {
      console.error('Navigation goBack error:', error);
      return false;
    } finally {
      setIsTransitioning(false);
    }
  }, [subPage, activeTab, goBackManager, virtualHistory, clearSubPage]);

  const pushHistory = useCallback((item: NavigationHistoryItem) => {
    virtualHistory.push({
      type: item.type,
      data: item.data,
    });
  }, [virtualHistory]);

  const clearHistory = useCallback(() => {
    virtualHistory.clear();
  }, [virtualHistory]);

  const value: NavigationContextType = {
    activeTab,
    subPage,
    canGoBack,
    isTransitioning,
    setActiveTab,
    handleTabChange,
    navigateToSubPage,
    clearSubPage,
    goBack,
    pushHistory,
    clearHistory,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
