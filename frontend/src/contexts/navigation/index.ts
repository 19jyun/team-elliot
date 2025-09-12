// src/contexts/navigation/index.ts
export { VirtualHistoryManager } from "./VirtualHistoryManager";
export { GoBackManager } from "./GoBackManager";
export type {
  HistoryEntry,
  VirtualHistoryState,
} from "./VirtualHistoryManager";
export type { GoBackContext, GoBackResult } from "../types/NavigationTypes";
