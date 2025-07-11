import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDashboardNavigation } from './DashboardContext';

export const adminNavigationItems = [
  { label: '수강생 관리', value: 0 },
  { label: '선생님 관리', value: 1 },
  { label: '수업 관리', value: 2 },
];

export interface AdminState {
  activeTab: number;
  // 필요한 관리자 전용 상태들 추가
}

interface AdminContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  navigationItems: typeof adminNavigationItems;
  handleTabChange: (tab: number) => void;
  // 필요한 관리자 전용 상태와 메서드 추가
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);

  const { clearSubPage } = useDashboardNavigation();

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
    // 탭 변경 시 관리자 관련 상태 초기화 (필요한 경우)
    // 현재는 추가 상태가 없으므로 기본 동작만 수행
    // DashboardContext의 SubPage도 초기화
    clearSubPage();
  };

  const value: AdminContextType = {
    activeTab,
    setActiveTab,
    navigationItems: adminNavigationItems,
    handleTabChange,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminContext must be used within an AdminProvider');
  return ctx;
}
