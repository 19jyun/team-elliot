import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/commonSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import permissionReducer from "./slices/permissionSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    ui: uiReducer,
    auth: authReducer,
    permission: permissionReducer,
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
