// src/contexts/forms/CreateClassFormContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CreateClassFormManager, CreateClassFormState, CreateClassStep, ClassFormData } from './CreateClassFormManager';
import { contextEventBus } from '../events/ContextEventBus';

interface CreateClassFormContextType {
  // 상태
  state: CreateClassFormState;
  
  // 편의 속성들 (하위 호환성)
  currentStep: CreateClassStep;
  classFormData: ClassFormData;
  selectedTeacherId: number | null;
  
  // 단계 관리
  setCurrentStep: (step: CreateClassStep) => void;
  
  // 데이터 관리
  setClassFormData: (data: Partial<ClassFormData>) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;
  
  // 초기화
  reset: () => void;
}

const CreateClassFormContext = createContext<CreateClassFormContextType | undefined>(undefined);

export const useCreateClassForm = (): CreateClassFormContextType => {
  const context = useContext(CreateClassFormContext);
  if (!context) {
    throw new Error('useCreateClassForm must be used within a CreateClassFormProvider');
  }
  return context;
};

interface CreateClassFormProviderProps {
  children: React.ReactNode;
}

export const CreateClassFormProvider: React.FC<CreateClassFormProviderProps> = ({ children }) => {
  const [manager] = useState(() => new CreateClassFormManager(contextEventBus));
  const [state, setState] = useState<CreateClassFormState>(manager.getState());

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
      if (data.subPage !== 'create-class') {
        manager.reset();
      }
    });

    return unsubscribe;
  }, [manager]);

  // Context 메서드들
  const setCurrentStep = useCallback((step: CreateClassStep) => {
    manager.setCurrentStep(step);
  }, [manager]);

  const setClassFormData = useCallback((data: Partial<ClassFormData>) => {
    manager.setClassFormData(data);
  }, [manager]);

  const setSelectedTeacherId = useCallback((teacherId: number | null) => {
    manager.setSelectedTeacherId(teacherId);
  }, [manager]);

  const reset = useCallback(() => {
    manager.reset();
  }, [manager]);

  const value: CreateClassFormContextType = {
    state,
    // 편의 속성들 (하위 호환성)
    currentStep: state.currentStep,
    classFormData: state.classFormData,
    selectedTeacherId: state.selectedTeacherId,
    setCurrentStep,
    setClassFormData,
    setSelectedTeacherId,
    reset,
  };

  return (
    <CreateClassFormContext.Provider value={value}>
      {children}
    </CreateClassFormContext.Provider>
  );
};
