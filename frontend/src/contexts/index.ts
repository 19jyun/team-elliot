// src/contexts/index.ts
// 메인 AppContext
export { AppProvider, useApp } from "./AppContext";

// 개별 Context들 (하위 호환성)
export { useNavigationContext } from "./AppContext";
export { useEnrollmentFormContext } from "./AppContext";
export { useCreateClassFormContext } from "./AppContext";
export { useAuthFormContext } from "./AppContext";
export { usePersonManagementFormContext } from "./AppContext";
export { useUIContext } from "./AppContext";
// Navigation
export {
  NavigationProvider,
  useNavigation,
} from "./navigation/NavigationContext";

// Forms
export * from "./forms";

// UI
export { UIContextProvider, useUI } from "./UIContext";

// Events
export * from "./events";
