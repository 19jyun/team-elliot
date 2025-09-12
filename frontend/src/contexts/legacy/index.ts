// 새로운 통합 컨텍스트 시스템
export { AppProvider, useApp } from "./AppContext";
export {
  NavigationProvider,
  useNavigation,
  useDashboardNavigation,
} from "./NavigationContext";
export {
  FormProvider,
  useForm,
  useAuth,
  usePrincipalContext,
  useStudentContext,
  useTeacherContext,
} from "./FormContext";
export { UIProvider, useUI } from "./UIContext";
export { DataProvider, useData } from "./DataContext";

// 타입 정의
export * from "./types";

// 기존 컨텍스트와의 호환성을 위한 별칭들
export { useDashboardNavigation as useDashboardNavigationLegacy } from "./NavigationContext";
export { useAuth as useAuthLegacy } from "./FormContext";
export { usePrincipalContext as usePrincipalContextLegacy } from "./FormContext";
export { useStudentContext as useStudentContextLegacy } from "./FormContext";
export { useTeacherContext as useTeacherContextLegacy } from "./FormContext";
