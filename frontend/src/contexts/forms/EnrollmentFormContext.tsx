// src/contexts/forms/EnrollmentFormContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { EnrollmentFormManager, EnrollmentFormState, EnrollmentStep, ClassesWithSessionsByMonthResponse, SessionData } from './EnrollmentFormManager';
import { contextEventBus } from '../events/ContextEventBus';

interface EnrollmentFormContextType {
  // 상태
  state: EnrollmentFormState;
  
  // 단계 관리
  setCurrentStep: (step: EnrollmentStep) => void;
  
  // 데이터 관리
  setSelectedMonth: (month: number) => void;
  setSelectedClasses: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  setSelectedSessions: (sessions: SessionData[]) => void;
  setSelectedClassIds: (classIds: number[]) => void;
  setSelectedAcademyId: (academyId: number | null) => void;
  setSelectedClassesWithSessions: (classes: ClassesWithSessionsByMonthResponse[]) => void;
  
  // 초기화
  reset: () => void;
}

const EnrollmentFormContext = createContext<EnrollmentFormContextType | undefined>(undefined);

export const useEnrollmentForm = (): EnrollmentFormContextType => {
  const context = useContext(EnrollmentFormContext);
  if (!context) {
    throw new Error('useEnrollmentForm must be used within an EnrollmentFormProvider');
  }
  return context;
};

interface EnrollmentFormProviderProps {
  children: React.ReactNode;
}

export const EnrollmentFormProvider: React.FC<EnrollmentFormProviderProps> = ({ children }) => {
  const [manager] = useState(() => new EnrollmentFormManager(contextEventBus));
  const [state, setState] = useState<EnrollmentFormState>(manager.getState());

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
      if (data.subPage !== 'enroll') {
        manager.reset();
      }
    });

    return unsubscribe;
  }, [manager]);

  // Context 메서드들
  const setCurrentStep = useCallback((step: EnrollmentStep) => {
    manager.setCurrentStep(step);
  }, [manager]);

  const setSelectedMonth = useCallback((month: number) => {
    manager.setSelectedMonth(month);
  }, [manager]);

  const setSelectedClasses = useCallback((classes: ClassesWithSessionsByMonthResponse[]) => {
    manager.setSelectedClasses(classes);
  }, [manager]);

  const setSelectedSessions = useCallback((sessions: SessionData[]) => {
    manager.setSelectedSessions(sessions);
  }, [manager]);

  const setSelectedClassIds = useCallback((classIds: number[]) => {
    manager.setSelectedClassIds(classIds);
  }, [manager]);

  const setSelectedAcademyId = useCallback((academyId: number | null) => {
    manager.setSelectedAcademyId(academyId);
  }, [manager]);

  const setSelectedClassesWithSessions = useCallback((classes: ClassesWithSessionsByMonthResponse[]) => {
    manager.setSelectedClassesWithSessions(classes);
  }, [manager]);

  const reset = useCallback(() => {
    manager.reset();
  }, [manager]);

  const value: EnrollmentFormContextType = {
    state,
    setCurrentStep,
    setSelectedMonth,
    setSelectedClasses,
    setSelectedSessions,
    setSelectedClassIds,
    setSelectedAcademyId,
    setSelectedClassesWithSessions,
    reset,
  };

  return (
    <EnrollmentFormContext.Provider value={value}>
      {children}
    </EnrollmentFormContext.Provider>
  );
};
