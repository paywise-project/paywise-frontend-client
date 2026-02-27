import { PaymentItemDtov1 } from "@/lib/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TransactionsTab = "expense" | "income";

type TransactionsState = {
  activeTab: TransactionsTab;
  transaction: PaymentItemDtov1 | null;
};

const initialState: TransactionsState = {
  activeTab: "expense",
  transaction: null,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<TransactionsTab>) {
      state.activeTab = action.payload;
    },
    setTransAction(state, action: PayloadAction<PaymentItemDtov1 | null>) {
      state.transaction = action.payload;
    },
  },
});

export const { setActiveTab, setTransAction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
