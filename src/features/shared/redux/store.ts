import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "@/features/trans/slice/transSlice";
import authReducer from "@/features/shared/auth/slice/authSlice";
import panelReducer from "@/features/panel/slice/panelSlice";

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    auth: authReducer,
    panel: panelReducer,
  },
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
