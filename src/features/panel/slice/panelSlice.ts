import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RoutePanelState = {
  isOpen: boolean;
};

const initialState: RoutePanelState = {
  isOpen: false,
};

const routePanelSlice = createSlice({
  name: "routePanel",
  initialState,
  reducers: {
    openPanel(state) {
      state.isOpen = true;
    },
    closePanel(state) {
      state.isOpen = false;
    },
    setOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    togglePanel(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openPanel, closePanel, setOpen, togglePanel } =
  routePanelSlice.actions;
export default routePanelSlice.reducer;
