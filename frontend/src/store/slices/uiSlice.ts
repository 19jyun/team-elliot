import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  // 전역 로딩 상태
  globalLoading: boolean;

  // 모달 상태
  modals: {
    [key: string]: boolean;
  };

  // 알림 상태
  notifications: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    timestamp: number;
  }[];

  // 사이드바 상태
  sidebarOpen: boolean;

  // 테마 설정
  theme: "light" | "dark";
}

const initialState: UIState = {
  globalLoading: false,
  modals: {},
  notifications: [],
  sidebarOpen: false,
  theme: "light",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // 전역 로딩 상태 설정
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },

    // 모달 상태 설정
    setModalOpen: (state, action) => {
      const { modalId, isOpen } = action.payload;
      state.modals[modalId] = isOpen;
    },

    // 알림 추가
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...action.payload,
      });
    },

    // 알림 제거
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    // 모든 알림 제거
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // 사이드바 상태 설정
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    // 테마 설정
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const {
  setGlobalLoading,
  setModalOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setSidebarOpen,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
