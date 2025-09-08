import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDashboardNavigation } from './DashboardContext';

export const teacherNavigationItems = [
  { label: '내 수업', value: 0 },
  { label: '수업 관리', value: 1 },
  { label: '나의 정보', value: 2 },
];

interface TeacherContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  navigationItems: typeof teacherNavigationItems;
  handleTabChange: (tab: number) => void;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  const { clearSubPage } = useDashboardNavigation();

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
    // DashboardContext의 SubPage 초기화
    clearSubPage();
  };

  const value: TeacherContextType = {
    activeTab,
    setActiveTab,
    navigationItems: teacherNavigationItems,
    handleTabChange,
  };

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}

export function useTeacherContext() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error('useTeacherContext must be used within a TeacherProvider');
  return ctx;
}

export function useOptionalTeacherContext() {
  const ctx = useContext(TeacherContext);
  return ctx;
}