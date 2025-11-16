import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * 캘린더 동기화 Slice
 *
 * 디바이스 캘린더와의 동기화 작업을 관리하는 큐
 * React Query 데이터 변경 시 여기에 동기화 작업을 추가
 */

interface CalendarSyncState {
  // 동기화 큐 (React Query 데이터 변경 시 여기에 추가)
  syncQueue: {
    id: string;
    type: "add" | "update" | "remove";
    sessionId: number;
    timestamp: number;
  }[];

  // 동기화 설정
  isEnabled: boolean;
  lastSyncTime: number | null;

  // 동기화 상태
  isSyncing: boolean;
}

const initialState: CalendarSyncState = {
  syncQueue: [],
  isEnabled: false,
  lastSyncTime: null,
  isSyncing: false,
};

const calendarSyncSlice = createSlice({
  name: "calendarSync",
  initialState,
  reducers: {
    // 동기화 큐에 추가
    enqueueSync: (
      state,
      action: PayloadAction<{
        type: "add" | "update" | "remove";
        sessionId: number;
      }>
    ) => {
      state.syncQueue.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        ...action.payload,
        timestamp: Date.now(),
      });
    },

    // 동기화 완료 처리
    dequeueSync: (state, action: PayloadAction<string>) => {
      state.syncQueue = state.syncQueue.filter(
        (item) => item.id !== action.payload
      );
      state.lastSyncTime = Date.now();
      state.isSyncing = false;
    },

    // 동기화 설정
    setSyncEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },

    // 동기화 상태 설정
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },

    // 큐 초기화
    clearSyncQueue: (state) => {
      state.syncQueue = [];
      state.isSyncing = false;
    },
  },
});

export const {
  enqueueSync,
  dequeueSync,
  setSyncEnabled,
  setSyncing,
  clearSyncQueue,
} = calendarSyncSlice.actions;

export default calendarSyncSlice.reducer;
