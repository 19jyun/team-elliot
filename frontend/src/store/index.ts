import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/commonSlice";
import teacherReducer from "./slices/teacherSlice";
import principalReducer from "./slices/principalSlice";
import studentReducer from "./slices/studentSlice";
import adminReducer from "./slices/adminSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    teacher: teacherReducer,
    principal: principalReducer,
    student: studentReducer,
    admin: adminReducer,
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
