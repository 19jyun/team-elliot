import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useDashboardNavigation } from './DashboardContext';

const principalNavigationItems = [
  { label: '강의 관리', value: 0 },
  { label: '수강생/강사 관리', value: 1 },
  { label: '학원 관리', value: 2 },
  { label: '나의 정보', value: 3 },
];

interface PrincipalCreateClassState {
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

// Principal 인원 관리 단계 타입
type PrincipalPersonManagementStep = 'class-list' | 'session-list' | 'request-detail';

// Principal 인원 관리 상태 인터페이스
export interface PrincipalPersonManagementState {
  currentStep: PrincipalPersonManagementStep;
  selectedTab: 'enrollment' | 'refund';
  selectedClassId: number | null;
  selectedSessionId: number | null;
  selectedRequestId: number | null;
  selectedRequestType: 'enrollment' | 'refund' | null;
}

interface PrincipalContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  createClass: PrincipalCreateClassState;
  setCreateClass: (state: PrincipalCreateClassState) => void;
  personManagement: PrincipalPersonManagementState;
  navigationItems: typeof principalNavigationItems;
  handleTabChange: (tab: number) => void;
  // 인원 관리 관련 메서드들
  setPersonManagementStep: (step: PrincipalPersonManagementStep) => void;
  setPersonManagementTab: (tab: 'enrollment' | 'refund') => void;
  setSelectedClassId: (classId: number | null) => void;
  setSelectedSessionId: (sessionId: number | null) => void;
  setSelectedRequestId: (requestId: number | null) => void;
  setSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => void;
  resetPersonManagement: () => void;
  goBack: () => void;
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
  const [personManagement, setPersonManagement] = useState<PrincipalPersonManagementState>({
    currentStep: 'class-list',
    selectedTab: 'enrollment',
    selectedClassId: null,
    selectedSessionId: null,
    selectedRequestId: null,
    selectedRequestType: null,
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
    // 인원 관리 상태도 초기화
    setPersonManagement({
      currentStep: 'class-list',
      selectedTab: 'enrollment',
      selectedClassId: null,
      selectedSessionId: null,
      selectedRequestId: null,
      selectedRequestType: null,
    });
    // DashboardContext의 SubPage도 초기화
    clearSubPage();
  };

  // 인원 관리 단계 설정
  const setPersonManagementStep = useCallback((step: PrincipalPersonManagementStep) => {
    setPersonManagement(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  // 인원 관리 탭 설정
  const setPersonManagementTab = useCallback((tab: 'enrollment' | 'refund') => {
    setPersonManagement(prev => ({
      ...prev,
      selectedTab: tab,
    }));
  }, []);

  // 선택된 클래스 ID 설정
  const setSelectedClassId = useCallback((classId: number | null) => {
    setPersonManagement(prev => ({
      ...prev,
      selectedClassId: classId,
    }));
  }, []);

  // 선택된 세션 ID 설정
  const setSelectedSessionId = useCallback((sessionId: number | null) => {
    setPersonManagement(prev => ({
      ...prev,
      selectedSessionId: sessionId,
    }));
  }, []);

  // 선택된 요청 ID 설정
  const setSelectedRequestId = useCallback((requestId: number | null) => {
    setPersonManagement(prev => ({
      ...prev,
      selectedRequestId: requestId,
    }));
  }, []);

  // 선택된 요청 타입 설정
  const setSelectedRequestType = useCallback((requestType: 'enrollment' | 'refund' | null) => {
    setPersonManagement(prev => ({
      ...prev,
      selectedRequestType: requestType,
    }));
  }, []);

  // 인원 관리 상태 초기화
  const resetPersonManagement = useCallback(() => {
    setPersonManagement({
      currentStep: 'class-list',
      selectedTab: 'enrollment',
      selectedClassId: null,
      selectedSessionId: null,
      selectedRequestId: null,
      selectedRequestType: null,
    });
  }, []);

  // 뒤로가기 함수 - personManagement 단계별 네비게이션 처리
  const goBack = useCallback(() => {
    setPersonManagement(prev => {
      switch (prev.currentStep) {
        case 'request-detail':
          return {
            ...prev,
            currentStep: 'session-list',
            selectedRequestId: null,
            selectedRequestType: null,
          };
        case 'session-list':
          return {
            ...prev,
            currentStep: 'class-list',
            selectedSessionId: null,
            selectedClassId: null,
          };
        default:
          return prev;
      }
    });
  }, []);

  const value: PrincipalContextType = {
    activeTab,
    setActiveTab,
    createClass,
    setCreateClass,
    personManagement,
    navigationItems: principalNavigationItems,
    handleTabChange,
    setPersonManagementStep,
    setPersonManagementTab,
    setSelectedClassId,
    setSelectedSessionId,
    setSelectedRequestId,
    setSelectedRequestType,
    resetPersonManagement,
    goBack,
  };

  return <PrincipalContext.Provider value={value}>{children}</PrincipalContext.Provider>;
}

export function usePrincipalContext() {
  const ctx = useContext(PrincipalContext);
  if (!ctx) throw new Error('usePrincipalContext must be used within a PrincipalProvider');
  return ctx;
}

export function useOptionalPrincipalContext() {
  const ctx = useContext(PrincipalContext);
  return ctx;
} 