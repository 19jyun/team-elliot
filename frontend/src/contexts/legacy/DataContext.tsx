'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  getCachedData: (key: string) => unknown;
  setCachedData: (key: string, data: unknown) => void;
  clearCache: (key?: string) => void;
  
  // 로딩 상태 관리
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  
  // 에러 상태 관리
  setError: (key: string, error: string | null) => void;
  getError: (key: string) => string | null;
  
  // 데이터 상태 확인
  isDataStale: (type: keyof DataState) => boolean;
  getLastUpdated: (type: keyof DataState) => number;
  
  // 데이터 초기화
  resetData: (type?: keyof DataState) => void;
  resetAllData: () => void;
  
  // 낙관적 업데이트
  addOptimisticData: (type: keyof DataState, data: BaseData & { isOptimistic?: boolean }) => void;
  replaceOptimisticData: (type: keyof DataState, optimisticId: string | number, realData: BaseData) => void;
  removeOptimisticData: (type: keyof DataState, optimisticId: string | number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({
    // 공통 데이터
    classes: [],
    sessions: [],
    students: [],
    teachers: [],
    academies: [],
    
    // 학생 관련 데이터
    enrollmentHistory: [],
    cancellationHistory: [],
    calendarSessions: [],
    availableClasses: [],
    userProfile: null,
    
    // 원장 관련 데이터
    enrollments: [],
    refundRequests: [],
    academy: null,
    
    // 캐시 및 메타데이터
    cache: {},
    lastUpdated: {},
    loading: {},
    errors: {},
  });

  // 데이터 조회
  const getData = useCallback((
    type: keyof DataState, 
    id?: string | number
  ): BaseData | BaseData[] | null => {
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
      [type]: Array.isArray(data) ? data : [data],
      lastUpdated: { ...prev.lastUpdated, [type]: Date.now() },
    }));
  }, []);

  const updateData = useCallback((
    type: keyof DataState, 
    id: string | number, 
    updates: Partial<BaseData>
  ) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        const updatedData = currentData.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        return {
          ...prev,
          [type]: updatedData,
          lastUpdated: { ...prev.lastUpdated, [type]: Date.now() },
        };
      }
      return prev;
    });
  }, []);

  const removeData = useCallback((type: keyof DataState, id: string | number) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        const filteredData = currentData.filter(item => item.id !== id);
        return {
          ...prev,
          [type]: filteredData,
          lastUpdated: { ...prev.lastUpdated, [type]: Date.now() },
        };
      }
      return prev;
    });
  }, []);

  // 캐시 관리
  const getCachedData = useCallback((key: string): unknown => {
    return state.cache[key] || null;
  }, [state.cache]);

  const setCachedData = useCallback((key: string, data: unknown) => {
    setState(prev => ({
      ...prev,
      cache: { ...prev.cache, [key]: data },
    }));
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      setState(prev => {
        const newCache = { ...prev.cache };
        delete newCache[key];
        return { ...prev, cache: newCache };
      });
    } else {
      setState(prev => ({ ...prev, cache: {} }));
    }
  }, []);

  // 로딩 상태 관리
  const setLoading = useCallback((key: string, loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: loading },
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return state.loading[key] || false;
  }, [state.loading]);

  // 에러 상태 관리
  const setError = useCallback((key: string, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error },
    }));
  }, []);

  const getError = useCallback((key: string) => {
    return state.errors[key] || null;
  }, [state.errors]);

  // 데이터 상태 확인
  const isDataStale = useCallback((type: keyof DataState) => {
    const lastUpdated = state.lastUpdated[type] || 0;
    const now = Date.now();
    return now - lastUpdated > 5 * 60 * 1000; // 5분
  }, [state.lastUpdated]);

  const getLastUpdated = useCallback((type: keyof DataState) => {
    return state.lastUpdated[type] || 0;
  }, [state.lastUpdated]);

  // 데이터 초기화
  const resetData = useCallback((type?: keyof DataState) => {
    if (type) {
      setState(prev => ({
        ...prev,
        [type]: Array.isArray(prev[type]) ? [] : null,
        lastUpdated: { ...prev.lastUpdated, [type]: 0 },
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
  const addOptimisticData = useCallback((
    type: keyof DataState, 
    data: BaseData & { isOptimistic?: boolean }
  ) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        return {
          ...prev,
          [type]: [{ ...data, isOptimistic: true }, ...currentData],
          lastUpdated: { ...prev.lastUpdated, [type]: Date.now() },
        };
      }
      return prev;
    });
  }, []);

  const replaceOptimisticData = useCallback((
    type: keyof DataState, 
    optimisticId: string | number, 
    realData: BaseData
  ) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        const updatedData = currentData.map(item => 
          item.id === optimisticId ? { ...realData, isOptimistic: false } : item
        );
        return {
          ...prev,
          [type]: updatedData,
          lastUpdated: { ...prev.lastUpdated, [type]: Date.now() },
        };
      }
      return prev;
    });
  }, []);

  const removeOptimisticData = useCallback((type: keyof DataState, optimisticId: string | number) => {
    setState(prev => {
      const currentData = prev[type];
      if (Array.isArray(currentData)) {
        const filteredData = currentData.filter(item => item.id !== optimisticId);
        return {
          ...prev,
          [type]: filteredData,
          lastUpdated: { ...prev.lastUpdated, [type]: Date.now() },
        };
      }
      return prev;
    });
  }, []);

  const value: DataContextType = {
    getData,
    getAllData,
    setData,
    updateData,
    removeData,
    getCachedData,
    setCachedData,
    clearCache,
    setLoading,
    isLoading,
    setError,
    getError,
    isDataStale,
    getLastUpdated,
    resetData,
    resetAllData,
    addOptimisticData,
    replaceOptimisticData,
    removeOptimisticData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
