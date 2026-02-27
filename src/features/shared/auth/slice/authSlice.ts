import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  customerUuid: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  customerUuid: null,
  isAuthenticated: false,
};

type SetCredentialsPayload = {
  customerUuid: string;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.customerUuid = action.payload.customerUuid;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.customerUuid = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
