import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  customerUuid: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  customerUuid: null,
  isAuthenticated: false,
};

type SetCredentialsPayload = {
  accessToken: string;
  refreshToken: string;
  customerUuid: string;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.customerUuid = action.payload.customerUuid;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.customerUuid = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
