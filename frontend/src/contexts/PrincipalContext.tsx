import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDashboardNavigation } from './DashboardContext';

export const principalNavigationItems = [
  { label: '강의 관리', value: 0 },
  { label: '수강생/강사 관리', value: 1 },
  { label: '학원 관리', value: 2 },
  { label: '나의 정보', value: 3 },
];

export interface PrincipalCreateClassState {
  currentStep: 'info' | 'teacher' | 'schedule' | 'content' | 'complete';
  classFormData: {
    name: string;
    description: string;
    maxStudents: number;
    price: number;
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
      startDate: string;
      endDate: string;
    };
    content: string;
    academyId?: number;
  };
  selectedTeacherId: number | null;
}

interface PrincipalContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  createClass: PrincipalCreateClassState;
  setCreateClass: (state: PrincipalCreateClassState) => void;
  navigationItems: typeof principalNavigationItems;
  handleTabChange: (tab: number) => void;
}

const PrincipalContext = createContext<PrincipalContextType | undefined>(undefined);

export function PrincipalProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  const [createClass, setCreateClass] = useState<PrincipalCreateClassState>({
    currentStep: 'info',
    classFormData: {
      name: '',
      description: '',
      maxStudents: 10,
      price: 0,
      schedule: {
        days: [],
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: '',
      },
      content: '',
    },
    selectedTeacherId: null,
  });

  const { clearSubPage } = useDashboardNavigation();

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
    // 탭 변경 시 createClass 상태 초기화
    setCreateClass({
      currentStep: 'info',
      classFormData: {
        name: '',
        description: '',
        maxStudents: 10,
        price: 0,
        schedule: {
          days: [],
          startTime: '',
          endTime: '',
          startDate: '',
          endDate: '',
        },
        content: '',
      },
      selectedTeacherId: null,
    });
    // DashboardContext의 SubPage도 초기화
    clearSubPage();
  };

  const value: PrincipalContextType = {
    activeTab,
    setActiveTab,
    createClass,
    setCreateClass,
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