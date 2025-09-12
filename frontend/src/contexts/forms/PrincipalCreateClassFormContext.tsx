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

  // 데이터 관리
  setClassFormData: (data: Partial<PrincipalClassFormData>) => void;
  setSelectedTeacherId: (teacherId: number | null) => void;

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

  // 이벤트 버스 구독
  useEffect(() => {
    const unsubscribe = contextEventBus.subscribe("navigationChanged", (data) => {
      // 네비게이션 변경 시 폼 상태 초기화 (필요한 경우)
      if (data.subPage !== "create-class") {
        manager.reset();
      }
    });

    return unsubscribe;
  }, [manager]);

  // Context 메서드들
  const setCurrentStep = useCallback((step: PrincipalCreateClassStep) => {
    manager.setCurrentStep(step);
  }, [manager]);

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

  const value: PrincipalCreateClassFormContextType = {
    state,
    setCurrentStep,
    setClassFormData,
    setSelectedTeacherId,
    reset,
  };

  return (
    <PrincipalCreateClassFormContext.Provider value={value}>
      {children}
    </PrincipalCreateClassFormContext.Provider>
  );
};
