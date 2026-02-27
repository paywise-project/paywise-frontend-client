import { AppDispatch, AppRootState } from "@/features/shared/redux/store";
import { closePanel } from "./panelSlice";

export const closePanelWithCallback =
  (onClose?: () => void, opts?: { onlyIfWasOpen?: boolean }) =>
  (dispatch: AppDispatch, getState: () => AppRootState) => {
    const wasOpen = getState().panel.isOpen;

    dispatch(closePanel());

    const shouldRun = opts?.onlyIfWasOpen ? wasOpen : true;
    if (shouldRun) onClose?.();
  };
