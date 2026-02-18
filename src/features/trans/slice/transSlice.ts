import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TransactionsTab = "expenses" | "income";

type TransactionsState = {
  activeTab: TransactionsTab;
};

const initialState: TransactionsState = {
  activeTab: "expenses",
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<TransactionsTab>) {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = transactionsSlice.actions;
export default transactionsSlice.reducer;
