// src/contexts/state/StateSyncTypes.ts
// StateSync 시스템의 타입 정의

import { EnrollmentFormState } from "../forms/EnrollmentFormManager";
import { EnrollmentModificationFormState } from "../forms/EnrollmentModificationFormManager";
import { CreateClassFormState } from "../forms/CreateClassFormManager";
import { AuthFormState } from "../forms/AuthFormManager";
import { PersonManagementFormState } from "../forms/PersonManagementFormManager";
import { PrincipalCreateClassFormState } from "../forms/PrincipalCreateClassFormManager";
import { NavigationItem } from "../types/NavigationTypes";

// 네비게이션 상태 타입
export interface NavigationState {
  activeTab: number;
  navigationItems: NavigationItem[];
}

// 폼 상태 통합 타입
export interface FormsState {
  enrollment: EnrollmentFormState;
  enrollmentModification: EnrollmentModificationFormState;
  createClass: CreateClassFormState;
  auth: AuthFormState;
  personManagement: PersonManagementFormState;
  principalCreateClass: PrincipalCreateClassFormState;
  principalPersonManagement: PersonManagementFormState;
}

// UI 상태 타입
export interface UIState {
  modals: Array<{
    id: string;
    type: string;
    title?: string;
    content?: React.ReactNode;
    onClose?: () => void;
    closable?: boolean;
  }>;
  loading: Record<string, boolean>;
  focus: {
    current: "dashboard" | "modal" | "subpage" | "overlay";
    history: Array<"dashboard" | "modal" | "subpage" | "overlay">;
    isTransitioning: boolean;
  };
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  isFocusTransitioning: boolean;
}

// 데이터 상태 타입
export interface DataState {
  classes: Array<{ id: string | number; [key: string]: unknown }>;
  sessions: Array<{ id: string | number; [key: string]: unknown }>;
  students: Array<{ id: string | number; [key: string]: unknown }>;
  teachers: Array<{ id: string | number; [key: string]: unknown }>;
  academies: Array<{ id: string | number; [key: string]: unknown }>;
  enrollmentHistory: Array<{ id: string | number; [key: string]: unknown }>;
  cancellationHistory: Array<{ id: string | number; [key: string]: unknown }>;
  calendarSessions: Array<{ id: string | number; [key: string]: unknown }>;
  availableClasses: Array<{ id: string | number; [key: string]: unknown }>;
  userProfile: { id: string | number; [key: string]: unknown } | null;
  enrollments: Array<{ id: string | number; [key: string]: unknown }>;
  refundRequests: Array<{ id: string | number; [key: string]: unknown }>;
  academy: { id: string | number; [key: string]: unknown } | null;
  cache: Record<string, unknown>;
  lastUpdated: Record<string, number>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

// 전역 상태 통합 타입
export interface GlobalState {
  navigation: NavigationState;
  forms: FormsState;
  ui: UIState;
  data: DataState;
}

// StateSync 키 타입
export type StateKey = keyof GlobalState;

// StateSync 값 타입
export type StateValue<T extends StateKey> = GlobalState[T];

// StateSync 리스너 타입
export type StateListener<T extends StateKey> = (state: StateValue<T>) => void;

// StateSync 구독 해제 함수 타입
export type UnsubscribeFunction = () => void;

// StateSync 컨텍스트 타입
export interface StateSyncContextType {
  subscribe: <T extends StateKey>(
    key: T,
    callback: StateListener<T>
  ) => UnsubscribeFunction;
  publish: <T extends StateKey>(key: T, state: StateValue<T>) => void;
  getState: <T extends StateKey>(key: T) => StateValue<T> | null;
  syncStates: (states: Partial<GlobalState>) => void;
  clearState: (key: StateKey) => void;
  clearAllStates: () => void;
}
