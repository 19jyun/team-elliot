// src/contexts/forms/PrincipalCreateClassFormContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  PrincipalCreateClassFormManager,
  PrincipalCreateClassFormState,
  PrincipalCreateClassStep,
  PrincipalClassFormData,
} from "./PrincipalCreateClassFormManager";
import { contextEventBus } from "../events/ContextEventBus";

interface PrincipalCreateClassFormContextType {
  // 상태
  state: PrincipalCreateClassFormState;

  // 단계 관리
  setCurrentStep: (step: PrincipalCreateClassStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // 데이터 관리 (기존)
  setClassFormData: (data: Partial<PrincipalClassFormData>) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;

  // 편의 actions (Step별 데이터 설정)
  actions: {
    setInfo: (data: {
      name: string;
      description: string;
      level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
      maxStudents: number;
      price: number;
    }) => void;
    setTeacher: (teacherId: number) => void;
    setSchedule: (data: {
      startDate: string;
      endDate: string;
      schedules: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }[];
    }) => void;
  };

  // 초기화
  reset: () => void;
}

const PrincipalCreateClassFormContext = createContext<
  PrincipalCreateClassFormContextType | undefined
>(undefined);

export const usePrincipalCreateClassForm =
  (): PrincipalCreateClassFormContextType => {
    const context = useContext(PrincipalCreateClassFormContext);
    if (!context) {
      throw new Error(
        "usePrincipalCreateClassForm must be used within a PrincipalCreateClassFormProvider"
      );
    }
    return context;
  };

interface PrincipalCreateClassFormProviderProps {
  children: React.ReactNode;
}

export const PrincipalCreateClassFormProvider: React.FC<
  PrincipalCreateClassFormProviderProps
> = ({ children }) => {
  const [manager] = useState(
    () => new PrincipalCreateClassFormManager(contextEventBus)
  );
  const [state, setState] = useState<PrincipalCreateClassFormState>(
    manager.getState()
  );

  // Manager 상태 구독
  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [manager]);

  // Context 메서드들
  const setCurrentStep = useCallback((step: PrincipalCreateClassStep) => {
    manager.setCurrentStep(step);
  }, [manager]);

  const nextStep = useCallback(() => {
    const stepOrder: PrincipalCreateClassStep[] = [
      "info",
      "teacher",
      "schedule",
      "content",
      "complete",
    ];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      manager.setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [manager, state.currentStep]);

  const prevStep = useCallback(() => {
    const stepOrder: PrincipalCreateClassStep[] = [
      "info",
      "teacher",
      "schedule",
      "content",
      "complete",
    ];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      manager.setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [manager, state.currentStep]);

  const setClassFormData = useCallback(
    (data: Partial<PrincipalClassFormData>) => {
      manager.setClassFormData(data);
    },
    [manager]
  );

  const setSelectedTeacherId = useCallback((teacherId: number | null) => {
    manager.setSelectedTeacherId(teacherId);
  }, [manager]);

  const reset = useCallback(() => {
    manager.reset();
  }, [manager]);

  // Actions 객체
  const actions = {
    setInfo: useCallback(
      (data: {
        name: string;
        description: string;
        level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
        maxStudents: number;
        price: number;
      }) => {
        manager.setInfo(data);
      },
      [manager]
    ),
    setTeacher: useCallback(
      (teacherId: number) => {
        manager.setTeacher(teacherId);
      },
      [manager]
    ),
    setSchedule: useCallback(
      (data: {
        startDate: string;
        endDate: string;
        schedules: {
          dayOfWeek: number;
          startTime: string;
          endTime: string;
        }[];
      }) => {
        manager.setSchedule(data);
      },
      [manager]
    ),
  };

  const value: PrincipalCreateClassFormContextType = {
    state,
    setCurrentStep,
    nextStep,
    prevStep,
    setClassFormData,
    setSelectedTeacherId,
    actions,
    reset,
  };

  return (
    <PrincipalCreateClassFormContext.Provider value={value}>
      {children}
    </PrincipalCreateClassFormContext.Provider>
  );
};
