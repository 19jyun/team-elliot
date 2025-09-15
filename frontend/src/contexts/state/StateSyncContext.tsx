// src/contexts/state/StateSyncContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { 
  StateSyncContextType, 
  GlobalState, 
  StateKey, 
  StateValue, 
  StateListener, 
  UnsubscribeFunction 
} from './StateSyncTypes';

const StateSyncContext = createContext<StateSyncContextType | undefined>(undefined);

export const useStateSync = (): StateSyncContextType => {
  const context = useContext(StateSyncContext);
  if (!context) {
    throw new Error('useStateSync must be used within a StateSyncProvider');
  }
  return context;
};

interface StateSyncProviderProps {
  children: ReactNode;
}

export const StateSyncProvider: React.FC<StateSyncProviderProps> = ({ children }) => {
  // 상태 저장소
  const [stateStore, setStateStore] = useState<Partial<GlobalState>>({});
  
  // 리스너 저장소 (키별로 Set으로 관리)
  const listenersRef = useRef<Record<StateKey, Set<StateListener<StateKey>>>>({} as Record<StateKey, Set<StateListener<StateKey>>>);
  
  // 구독 함수
  const subscribe = useCallback(<T extends StateKey>(
    key: T, 
    callback: StateListener<T>
  ): UnsubscribeFunction => {
    // 리스너 등록
    if (!listenersRef.current[key]) {
      listenersRef.current[key] = new Set();
    }
    
    const listenerSet = listenersRef.current[key];
    listenerSet.add(callback as StateListener<StateKey>);
    
    // 구독 해제 함수 반환
    return () => {
      listenerSet.delete(callback as StateListener<StateKey>);
    };
  }, []);
  
  // 발행 함수
  const publish = useCallback(<T extends StateKey>(
    key: T, 
    state: StateValue<T>
  ): void => {
    // 상태 업데이트
    setStateStore(prev => ({
      ...prev,
      [key]: state
    }));
    
    // 해당 키를 구독하는 모든 리스너에게 알림
    const listenerSet = listenersRef.current[key];
    if (listenerSet) {
      listenerSet.forEach(callback => {
        try {
          (callback as StateListener<T>)(state);
        } catch (error) {
          console.error(`Error in state sync listener for ${key}:`, error);
        }
      });
    }
  }, []);
  
  // 상태 조회 함수
  const getState = useCallback(<T extends StateKey>(key: T): StateValue<T> | null => {
    return (stateStore[key] as StateValue<T>) || null;
  }, [stateStore]);
  
  // 상태 동기화 함수
  const syncStates = useCallback((states: Partial<GlobalState>): void => {
    setStateStore(prev => ({
      ...prev,
      ...states
    }));
    
    // 각 상태에 대해 리스너들에게 알림
    Object.entries(states).forEach(([key, value]) => {
      const stateKey = key as StateKey;
      const listenerSet = listenersRef.current[stateKey];
      if (listenerSet && value !== undefined) {
        listenerSet.forEach(callback => {
          try {
            (callback as StateListener<StateKey>)(value as StateValue<StateKey>);
          } catch (error) {
            console.error(`Error in state sync listener for ${stateKey}:`, error);
          }
        });
      }
    });
  }, []);
  
  // 개별 상태 클리어 함수
  const clearState = useCallback((key: StateKey): void => {
    setStateStore(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    
    // 해당 키의 리스너들도 클리어
    if (listenersRef.current[key]) {
      listenersRef.current[key].clear();
    }
  }, []);
  
  // 모든 상태 클리어 함수
  const clearAllStates = useCallback((): void => {
    setStateStore({});
    
    // 모든 리스너 클리어
    Object.keys(listenersRef.current).forEach(key => {
      listenersRef.current[key as StateKey].clear();
    });
  }, []);
  
  const value: StateSyncContextType = {
    subscribe,
    publish,
    getState,
    syncStates,
    clearState,
    clearAllStates,
  };
  
  return (
    <StateSyncContext.Provider value={value}>
      {children}
    </StateSyncContext.Provider>
  );
};
