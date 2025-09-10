import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/commonSlice";
import principalReducer from "./slices/principalSlice";
import studentReducer from "./slices/studentSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    principal: principalReducer,
    student: studentReducer,
    // admin 제거됨
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
