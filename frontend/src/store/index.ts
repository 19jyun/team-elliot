import { configureStore } from "@reduxjs/toolkit";
import appDataReducer from "./slices/appDataSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    appData: appDataReducer,
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
