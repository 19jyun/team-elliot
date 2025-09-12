// src/contexts/AppContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Navigation Context
import { NavigationProvider, useNavigation } from './NavigationContext';

// Form Contexts
import {
  EnrollmentFormProvider,
  useEnrollmentForm,
  CreateClassFormProvider,
  useCreateClassForm,
  AuthFormProvider,
  useAuthForm,
  PersonManagementFormProvider,
  usePersonManagementForm,
} from './forms';

// UI Context
import { UIContextProvider, useUI } from './UIContext';

// Data Context
import { DataContextProvider, useData } from './DataContext';

// Event Bus
import { contextEventBus } from './events/ContextEventBus';

// 통합된 AppContext 타입
interface AppContextType {
  // Navigation
  activeTab: number;
  subPage: string | null;
  canGoBack: boolean;
  isTransitioning: boolean;
  setActiveTab: (tab: number) => void;
  handleTabChange: (tab: number) => void;
  navigateToSubPage: (page: string) => void;
  clearSubPage: () => void;
  goBack: () => Promise<boolean>;

  // Forms
  forms: {
    enrollment: ReturnType<typeof useEnrollmentForm>;
    createClass: ReturnType<typeof useCreateClassForm>;
    auth: ReturnType<typeof useAuthForm>;
    personManagement: ReturnType<typeof usePersonManagementForm>;
  };

  // UI
  ui: ReturnType<typeof useUI>;

  // Data
  data: ReturnType<typeof useData>;

  // Session
  session: ReturnType<typeof useSession>;

  // 통합된 goBack (하위 호환성)
  goBackLegacy: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 내부 컴포넌트들
const NavigationConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  return <>{children}</>;
};

const FormsConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const enrollment = useEnrollmentForm();
  const createClass = useCreateClassForm();
  const auth = useAuthForm();
  const personManagement = usePersonManagementForm();

  return (
    <AppContext.Provider
      value={{
        // Navigation
        activeTab: navigation.activeTab,
        subPage: navigation.subPage,
        canGoBack: navigation.canGoBack,
        isTransitioning: navigation.isTransitioning,
        setActiveTab: navigation.setActiveTab,
        handleTabChange: navigation.handleTabChange,
        navigateToSubPage: navigation.navigateToSubPage,
        clearSubPage: navigation.clearSubPage,
        goBack: navigation.goBack,

        // Forms
        forms: {
          enrollment,
          createClass,
          auth,
          personManagement,
        },

        // UI
        ui: useUI(),

        // Data
        data: useData(),

        // Session
        session: useSession(),

        // 통합된 goBack (하위 호환성)
        goBackLegacy: navigation.goBack,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// 메인 AppProvider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <NavigationProvider>
      <EnrollmentFormProvider>
        <CreateClassFormProvider>
          <AuthFormProvider>
            <PersonManagementFormProvider>
              <UIContextProvider>
                <DataContextProvider>
                  <NavigationConsumer>
                    <FormsConsumer>
                      {children}
                    </FormsConsumer>
                  </NavigationConsumer>
                </DataContextProvider>
              </UIContextProvider>
            </PersonManagementFormProvider>
          </AuthFormProvider>
        </CreateClassFormProvider>
      </EnrollmentFormProvider>
    </NavigationProvider>
  );
};

// 하위 호환성을 위한 개별 Context들
export const useNavigationContext = useNavigation;
export const useEnrollmentFormContext = useEnrollmentForm;
export const useCreateClassFormContext = useCreateClassForm;
export const useAuthFormContext = useAuthForm;
export const usePersonManagementFormContext = usePersonManagementForm;
export const useUIContext = useUI;
export const useDataContext = useData;
