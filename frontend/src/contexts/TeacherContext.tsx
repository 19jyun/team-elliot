import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDashboardNavigation } from './DashboardContext';

export const teacherNavigationItems = [
  { label: '내 수업', value: 0 },
  { label: '수업 관리', value: 1 },
  { label: '나의 정보', value: 2 },
];

export interface TeacherCreateClassState {
  currentStep: 'info' | 'schedule' | 'content' | 'review' | 'complete';
  classFormData: {
    name: string;
    description: string;
    maxStudents: number;
    price: number;
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
    };
    content: string;
  };
}

interface TeacherContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  createClass: TeacherCreateClassState;
  setCreateClass: (state: TeacherCreateClassState) => void;
  navigationItems: typeof teacherNavigationItems;
  handleTabChange: (tab: number) => void;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  const [createClass, setCreateClass] = useState<TeacherCreateClassState>({
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
      },
      content: '',
    },
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
        },
        content: '',
      },
    });
    // DashboardContext의 SubPage도 초기화
    clearSubPage();
  };

  const value: TeacherContextType = {
    activeTab,
    setActiveTab,
    createClass,
    setCreateClass,
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
