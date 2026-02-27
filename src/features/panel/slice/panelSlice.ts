import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RoutePanelState = {
  isOpen: boolean;
  panelState: string;
};

const initialState: RoutePanelState = {
  isOpen: false,
  panelState: "",
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
    setPanelState(state, action: PayloadAction<string>) {
      state.panelState = action.payload;
    },
  },
});

export const { openPanel, closePanel, setOpen, togglePanel, setPanelState } =
  routePanelSlice.actions;
export default routePanelSlice.reducer;
