import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDashboardNavigation } from './DashboardContext';

export const studentNavigationItems = [
  { label: '클래스 정보', value: 0 },
  { label: '수강신청', value: 1 },
  { label: '나의 정보', value: 2 },
];

export interface StudentEnrollmentState {
  currentStep: 'main' | 'class-selection' | 'date-selection' | 'payment' | 'complete';
  selectedMonth: number | null;
  selectedClasses: unknown[];
  selectedSessions: unknown[];
  selectedClassIds: number[];
}

interface StudentContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  enrollment: StudentEnrollmentState;
  setEnrollment: (enrollment: StudentEnrollmentState) => void;
  navigationItems: typeof studentNavigationItems;
  handleTabChange: (tab: number) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  const [enrollment, setEnrollment] = useState<StudentEnrollmentState>({
    currentStep: 'main',
    selectedMonth: null,
    selectedClasses: [],
    selectedSessions: [],
    selectedClassIds: [],
  });

  const { clearSubPage } = useDashboardNavigation();

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
    // 탭 변경 시 enrollment 상태 초기화
    setEnrollment({
      currentStep: 'main',
      selectedMonth: null,
      selectedClasses: [],
      selectedSessions: [],
      selectedClassIds: [],
    });
    // DashboardContext의 SubPage도 초기화
    clearSubPage();
  };

  const value: StudentContextType = {
    activeTab,
    setActiveTab,
    enrollment,
    setEnrollment,
    navigationItems: studentNavigationItems,
    handleTabChange,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudentContext() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudentContext must be used within a StudentProvider');
  return ctx;
}

export function useOptionalStudentContext() {
  const ctx = useContext(StudentContext);
  return ctx;
}