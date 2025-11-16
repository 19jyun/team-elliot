import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/commonSlice";
import principalReducer from "./slices/principalSlice";
import studentReducer from "./slices/studentSlice";
import teacherReducer from "./slices/teacherSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import permissionReducer from "./slices/permissionSlice";
import calendarSyncReducer from "./slices/calendarSyncSlice";
import { calendarSyncMiddleware } from "./middleware/calendarSyncMiddleware";

export const store = configureStore({
  reducer: {
    // 기존 서버 상태 슬라이스 (점진적 제거 예정)
    common: commonReducer,
    principal: principalReducer,
    student: studentReducer,
    teacher: teacherReducer,
    ui: uiReducer,

    // 새로운 글로벌 비즈니스 상태 슬라이스
    auth: authReducer,
    permission: permissionReducer,
    calendarSync: calendarSyncReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).concat(calendarSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
