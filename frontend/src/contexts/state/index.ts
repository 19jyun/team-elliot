// src/contexts/state/index.ts
// StateSync 시스템의 진입점

export { StateSyncProvider, useStateSync } from "./StateSyncContext";
export type {
  StateSyncContextType,
  GlobalState,
  StateKey,
  StateValue,
  StateListener,
  UnsubscribeFunction,
  NavigationState,
  FormsState,
  UIState,
  DataState,
} from "./StateSyncTypes";
