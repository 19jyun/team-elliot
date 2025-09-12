// src/contexts/DataContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// 디바운스 유틸리티 함수
function debounce<TArgs extends readonly unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let timeout: NodeJS.Timeout;
  return (...args: TArgs) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 기본 데이터 타입
interface BaseData {
  id: string | number;
  [key: string]: unknown;
}

// 데이터 상태 타입
interface DataState {
  // 공통 데이터
  classes: BaseData[];
  sessions: BaseData[];
  students: BaseData[];
  teachers: BaseData[];
  academies: BaseData[];
  
  // 학생 관련 데이터
  enrollmentHistory: BaseData[];
  cancellationHistory: BaseData[];
  calendarSessions: BaseData[];
  availableClasses: BaseData[];
  userProfile: BaseData | null;
  
  // 원장 관련 데이터
  enrollments: BaseData[];
  refundRequests: BaseData[];
  academy: BaseData | null;
  
  // 캐시 및 메타데이터
  cache: Record<string, unknown>;
  lastUpdated: Record<string, number>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

// 컨텍스트 타입
interface DataContextType {
  // 데이터 조회
  getData: (type: keyof DataState, id?: string | number) => BaseData | BaseData[] | null;
  getAllData: (type: keyof DataState) => BaseData[];
  
  // 데이터 설정
  setData: (type: keyof DataState, data: BaseData | BaseData[]) => void;
  updateData: (type: keyof DataState, id: string | number, updates: Partial<BaseData>) => void;
  removeData: (type: keyof DataState, id: string | number) => void;
  
  // 캐시 관리
  getCache: (key: string) => unknown;
  setCache: (key: string, value: unknown) => void;
  clearCache: (key?: string) => void;
  
  // 로딩 관리
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  
  // 에러 관리
  setError: (key: string, error: string | null) => void;
  getError: (key: string) => string | null;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // 메타데이터 관리
  setLastUpdated: (key: string, timestamp: number) => void;
  getLastUpdated: (key: string) => number | null;
  
  // 데이터 초기화
  resetData: (type?: keyof DataState) => void;
  resetAllData: () => void;
  
  // 낙관적 업데이트
  addOptimisticData: (type: keyof DataState, data: BaseData & { isOptimistic?: boolean }) => void;
  replaceOptimisticData: (type: keyof DataState, optimisticId: string | number, realData: BaseData) => void;
  removeOptimisticData: (type: keyof DataState, optimisticId: string | number) => void;
  
  // 상태 조회
  getState: () => DataState;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataContextProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, setState] = useState<DataState>({
    classes: [],
    sessions: [],
    students: [],
    teachers: [],
    academies: [],
    enrollmentHistory: [],
    cancellationHistory: [],
    calendarSessions: [],
    availableClasses: [],
    userProfile: null,
    enrollments: [],
    refundRequests: [],
    academy: null,
    cache: {},
    lastUpdated: {},
    loading: {},
    errors: {},
  });

  // 데이터 조회
  const getData = useCallback((type: keyof DataState, id?: string | number): BaseData | BaseData[] | null => {
    const data = state[type];
    if (Array.isArray(data)) {
      if (id !== undefined) {
        return data.find(item => item.id === id) || null;
      }
      return data;
    }
    return data as BaseData | null;
  }, [state]);

  const getAllData = useCallback((type: keyof DataState): BaseData[] => {
    const data = state[type];
    return Array.isArray(data) ? data : [];
  }, [state]);

  // 데이터 설정
  const setData = useCallback((type: keyof DataState, data: BaseData | BaseData[]) => {
    setState(prev => ({
      ...prev,
      [type]: data,
      lastUpdated: {
        ...prev.lastUpdated,
        [type]: Date.now(),
      },
    }));
  }, []);

  const updateData = useCallback((type: keyof DataState, id: string | number, updates: Partial<BaseData>) => {
    setState(prev => {
      const data = prev[type];
      if (Array.isArray(data)) {
        const updatedData = data.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        return {
          ...prev,
          [type]: updatedData,
          lastUpdated: {
            ...prev.lastUpdated,
            [type]: Date.now(),
          },
        };
      }
      return prev;
    });
  }, []);

  const removeData = useCallback((type: keyof DataState, id: string | number) => {
    setState(prev => {
      const data = prev[type];
      if (Array.isArray(data)) {
        const filteredData = data.filter(item => item.id !== id);
        return {
          ...prev,
          [type]: filteredData,
          lastUpdated: {
            ...prev.lastUpdated,
            [type]: Date.now(),
          },
        };
      }
      return prev;
    });
  }, []);

  // 캐시 관리
  const getCache = useCallback((key: string): unknown => {
    return state.cache[key];
  }, [state.cache]);

  const setCache = useCallback((key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      cache: {
        ...prev.cache,
        [key]: value,
      },
    }));
  }, []);

  const clearCache = useCallback((key?: string) => {
    setState(prev => ({
      ...prev,
      cache: key ? { ...prev.cache, [key]: undefined } : {},
    }));
  }, []);

  // 로딩 관리
  const setLoading = useCallback((key: string, loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        [key]: loading,
      },
    }));
  }, []);

  const isLoading = useCallback((key: string): boolean => {
    return state.loading[key] || false;
  }, [state.loading]);

  // 에러 관리
  const setError = useCallback((key: string, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [key]: error,
      },
    }));
  }, []);

  const getError = useCallback((key: string): string | null => {
    return state.errors[key] || null;
  }, [state.errors]);

  const clearError = useCallback((key: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [key]: null,
      },
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
    }));
  }, []);

  // 메타데이터 관리
  const setLastUpdated = useCallback((key: string, timestamp: number) => {
    setState(prev => ({
      ...prev,
      lastUpdated: {
        ...prev.lastUpdated,
        [key]: timestamp,
      },
    }));
  }, []);

  const getLastUpdated = useCallback((key: string): number | null => {
    return state.lastUpdated[key] || null;
  }, [state.lastUpdated]);

  // 데이터 초기화
  const resetData = useCallback((type?: keyof DataState) => {
    if (type) {
      setState(prev => ({
        ...prev,
        [type]: Array.isArray(prev[type]) ? [] : null,
        lastUpdated: {
          ...prev.lastUpdated,
          [type]: Date.now(),
        },
      }));
    } else {
      setState(prev => ({
        ...prev,
        classes: [],
        sessions: [],
        students: [],
        teachers: [],
        academies: [],
        enrollmentHistory: [],
        cancellationHistory: [],
        calendarSessions: [],
        availableClasses: [],
        userProfile: null,
        enrollments: [],
        refundRequests: [],
        academy: null,
        lastUpdated: {},
      }));
    }
  }, []);

  const resetAllData = useCallback(() => {
    setState({
      classes: [],
      sessions: [],
      students: [],
      teachers: [],
      academies: [],
      enrollmentHistory: [],
      cancellationHistory: [],
      calendarSessions: [],
      availableClasses: [],
      userProfile: null,
      enrollments: [],
      refundRequests: [],
      academy: null,
      cache: {},
      lastUpdated: {},
      loading: {},
      errors: {},
    });
  }, []);

  // 낙관적 업데이트
  const addOptimisticData = useCallback((type: keyof DataState, data: BaseData & { isOptimistic?: boolean }) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        const optimisticData = { ...data, isOptimistic: true };
        return {
          ...prev,
          [type]: [...currentData, optimisticData],
          lastUpdated: {
            ...prev.lastUpdated,
            [type]: Date.now(),
          },
        };
      }
      return prev;
    });
  }, []);

  const replaceOptimisticData = useCallback((type: keyof DataState, optimisticId: string | number, realData: BaseData) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        const updatedData = currentData.map(item => 
          item.id === optimisticId && item.isOptimistic ? realData : item
        );
        return {
          ...prev,
          [type]: updatedData,
          lastUpdated: {
            ...prev.lastUpdated,
            [type]: Date.now(),
          },
        };
      }
      return prev;
    });
  }, []);

  const removeOptimisticData = useCallback((type: keyof DataState, optimisticId: string | number) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        const filteredData = currentData.filter(item => 
          !(item.id === optimisticId && item.isOptimistic)
        );
        return {
          ...prev,
          [type]: filteredData,
          lastUpdated: {
            ...prev.lastUpdated,
            [type]: Date.now(),
          },
        };
      }
      return prev;
    });
  }, []);

  // 성능 최적화: 메모이제이션된 데이터 조회 (현재 사용하지 않음)
  // const memoizedData = useMemo(() => ({
  //   classes: state.classes,
  //   sessions: state.sessions,
  //   teachers: state.teachers,
  //   students: state.students,
  //   academies: state.academies,
  //   enrollments: state.enrollments,
  // }), [
  //   state.classes, state.sessions, state.teachers, state.students,
  //   state.academies, state.enrollments
  // ]);

  // 성능 최적화: 디바운스된 데이터 업데이트
  const debouncedSetData = useCallback(
    (type: keyof DataState, data: BaseData | BaseData[]) => {
      const debouncedFn = debounce((t: keyof DataState, d: BaseData | BaseData[]) => {
        setData(t, d);
      }, 300);
      debouncedFn(type, data);
    },
    [setData]
  );

  // 상태 조회
  const getState = useCallback((): DataState => {
    return { ...state };
  }, [state]);

  const value: DataContextType = {
    getData,
    getAllData,
    setData: debouncedSetData, // 디바운스된 setData 사용
    updateData,
    removeData,
    getCache,
    setCache,
    clearCache,
    setLoading,
    isLoading,
    setError,
    getError,
    clearError,
    clearAllErrors,
    setLastUpdated,
    getLastUpdated,
    resetData,
    resetAllData,
    addOptimisticData,
    replaceOptimisticData,
    removeOptimisticData,
    getState,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
