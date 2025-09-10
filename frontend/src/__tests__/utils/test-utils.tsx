import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock store 생성
const createMockStore = () => {
  return configureStore({
    reducer: {
      // 필요한 리듀서들을 여기에 추가
      auth: (state = { user: null, isAuthenticated: false }) => state,
      student: (state = { profile: null, classes: [] }) => state,
      teacher: (state = { profile: null, classes: [] }) => state,
      principal: (state = { profile: null, dashboard: null }) => state,
    },
    preloadedState: {
      auth: { user: null, isAuthenticated: false },
      student: { profile: null, classes: [] },
      teacher: { profile: null, classes: [] },
      principal: { profile: null, dashboard: null },
    },
  });
};

// Mock QueryClient 생성
const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// 커스텀 렌더 함수
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createMockStore>;
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createMockStore(),
    queryClient = createMockQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock 데이터 생성 함수들
export const createMockUser = (role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL' = 'STUDENT') => ({
  id: '1',
  userId: `test-${role.toLowerCase()}`,
  name: `Test ${role}`,
  role,
  academyId: '1',
  academyName: 'Test Academy',
});

export const createMockClass = (overrides = {}) => ({
  id: '1',
  name: 'Test Ballet Class',
  description: 'Test class description',
  teacherId: '1',
  teacherName: 'Test Teacher',
  schedule: 'Monday 10:00-11:00',
  maxStudents: 15,
  currentStudents: 10,
  status: 'ACTIVE',
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  id: '1',
  classId: '1',
  className: 'Test Ballet Class',
  date: '2024-01-15',
  startTime: '10:00',
  endTime: '11:00',
  status: 'SCHEDULED',
  ...overrides,
});

// API 응답 모킹 함수
export const mockApiResponse = (data: any, status = 200) => {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };
};

// 에러 응답 모킹 함수
export const mockApiError = (message = 'Internal server error', status = 500) => {
  return {
    response: {
      data: { message },
      status,
      statusText: 'Internal Server Error',
      headers: {},
      config: {},
    },
  };
};

// 재내보내기
export * from '@testing-library/react';
export { customRender as render };
