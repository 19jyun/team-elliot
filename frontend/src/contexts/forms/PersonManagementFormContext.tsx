// src/contexts/forms/PersonManagementFormContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PersonManagementFormManager, PersonManagementFormState, PrincipalPersonManagementStep } from './PersonManagementFormManager';
import { contextEventBus } from '../events/ContextEventBus';

interface PersonManagementFormContextType {
  // 상태
  state: PersonManagementFormState;
  
  // 단계 관리
  setCurrentStep: (step: PrincipalPersonManagementStep) => void;
  setSelectedTab: (tab: 'enrollment' | 'refund') => void;
  
  // 선택 관리
  setSelectedClassId: (classId: number | null) => void;
  setSelectedSessionId: (sessionId: number | null) => void;
  setSelectedRequestId: (requestId: number | null) => void;
  setSelectedRequestType: (requestType: 'enrollment' | 'refund' | null) => void;
  
  // 초기화
  reset: () => void;
}

const PersonManagementFormContext = createContext<PersonManagementFormContextType | undefined>(undefined);

export const usePersonManagementForm = (): PersonManagementFormContextType => {
  const context = useContext(PersonManagementFormContext);
  if (!context) {
    throw new Error('usePersonManagementForm must be used within a PersonManagementFormProvider');
  }
  return context;
};

interface PersonManagementFormProviderProps {
  children: React.ReactNode;
}

export const PersonManagementFormProvider: React.FC<PersonManagementFormProviderProps> = ({ children }) => {
  const [manager] = useState(() => new PersonManagementFormManager(contextEventBus));
  const [state, setState] = useState<PersonManagementFormState>(manager.getState());

  // Manager 상태 구독
  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [manager]);

  // 이벤트 버스 구독
  useEffect(() => {
    const unsubscribe = contextEventBus.subscribe('navigationChanged', (data) => {
      // 네비게이션 변경 시 폼 상태 초기화 (필요한 경우)
      if (data.subPage !== 'person-management') {
        manager.reset();
      }
    });

    return unsubscribe;
  }, [manager]);

  // Context 메서드들
  const setCurrentStep = useCallback((step: PrincipalPersonManagementStep) => {
    manager.setCurrentStep(step);
  }, [manager]);

  const setSelectedTab = useCallback((tab: 'enrollment' | 'refund') => {
    manager.setSelectedTab(tab);
  }, [manager]);

  const setSelectedClassId = useCallback((classId: number | null) => {
    manager.setSelectedClassId(classId);
  }, [manager]);

  const setSelectedSessionId = useCallback((sessionId: number | null) => {
    manager.setSelectedSessionId(sessionId);
  }, [manager]);

  const setSelectedRequestId = useCallback((requestId: number | null) => {
    manager.setSelectedRequestId(requestId);
  }, [manager]);

  const setSelectedRequestType = useCallback((requestType: 'enrollment' | 'refund' | null) => {
    manager.setSelectedRequestType(requestType);
  }, [manager]);

  const reset = useCallback(() => {
    manager.reset();
  }, [manager]);

  const value: PersonManagementFormContextType = {
    state,
    setCurrentStep,
    setSelectedTab,
    setSelectedClassId,
    setSelectedSessionId,
    setSelectedRequestId,
    setSelectedRequestType,
    reset,
  };

  return (
    <PersonManagementFormContext.Provider value={value}>
      {children}
    </PersonManagementFormContext.Provider>
  );
};
