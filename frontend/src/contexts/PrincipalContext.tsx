import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDashboardNavigation } from './DashboardContext';

export const principalNavigationItems = [
  { label: '강의 관리', value: 0 },
  { label: '수강생/강사 관리', value: 1 },
  { label: '학원 관리', value: 2 },
  { label: '나의 정보', value: 3 },
];

interface PrincipalContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  navigationItems: typeof principalNavigationItems;
  handleTabChange: (tab: number) => void;
}

const PrincipalContext = createContext<PrincipalContextType | undefined>(undefined);

export function PrincipalProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  const { clearSubPage } = useDashboardNavigation();

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
    // DashboardContext의 SubPage 초기화
    clearSubPage();
  };

  const value: PrincipalContextType = {
    activeTab,
    setActiveTab,
    navigationItems: principalNavigationItems,
    handleTabChange,
  };

  return <PrincipalContext.Provider value={value}>{children}</PrincipalContext.Provider>;
}

export function usePrincipalContext() {
  const ctx = useContext(PrincipalContext);
  if (!ctx) throw new Error('usePrincipalContext must be used within a PrincipalProvider');
  return ctx;
} 