// src/contexts/types/NavigationTypes.ts
// 네비게이션 관련 타입 정의

export interface NavigationItem {
  id?: string;
  label: string;
  href?: string;
  path?: string;
  index: number;
  icon?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  children?: NavigationItem[];
}

export interface NavigationHistoryItem {
  id: string;
  timestamp: number;
  type: "navigation" | "form-step" | "subpage";
  data: {
    subPage?: string | null;
    activeTab?: number;
    formType?: string;
    formStep?: string;
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: "navigation" | "form-step" | "subpage";
  data: {
    subPage?: string | null;
    activeTab?: number;
    formType?: string;
    formStep?: string;
    title?: string;
    description?: string;
    entry?: NavigationHistoryItem;
    formData?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface GoBackContext {
  subPage: string | null;
  activeTab: number;
  formStates: {
    enrollment?: { currentStep: string };
    createClass?: { currentStep: string };
    auth?: { currentStep: string };
    personManagement?: { currentStep: string };
    principalPersonManagement?: { currentStep: string };
  };
  history: HistoryItem[];
  currentHistoryIndex: number;
}

export interface GoBackResult {
  success: boolean;
  action: "navigate" | "close" | "step-back" | "history-back" | "none";
  data?: {
    entry?: HistoryItem;
    subPage?: string | null;
    activeTab?: number;
    formType?: string;
    step?: string;
    [key: string]: unknown;
  };
  message?: string;
  shouldPreventDefault?: boolean;
}
