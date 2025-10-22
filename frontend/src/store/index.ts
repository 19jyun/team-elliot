import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/commonSlice";
import principalReducer from "./slices/principalSlice";
import studentReducer from "./slices/studentSlice";
import teacherReducer from "./slices/teacherSlice";
import uiReducer from "./slices/uiSlice";
import { calendarSyncMiddleware } from "./middleware/calendarSyncMiddleware";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    principal: principalReducer,
    student: studentReducer,
    teacher: teacherReducer,
    // admin 제거됨
    ui: uiReducer,
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
