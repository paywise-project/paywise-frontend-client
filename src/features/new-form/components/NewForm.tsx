"use client";

import { setPanelState, togglePanel } from "@/features/panel/slice/panelSlice";
import { useAppDispatch } from "@/features/shared/redux/hooks";

const NewForm = () => {
  const dispatch = useAppDispatch();
  const handleClick = (state: string) => {
    dispatch(togglePanel());
    dispatch(setPanelState(state));
  };

  return (
    <div className="py-4 space-y-4">
      <button
        type="button"
        className="pw-press | w-full h-14 bg-primary text-surface py-2 rounded-lg hover:bg-primary-2"
        onClick={() => handleClick("income")}
      >
        افزودن درآمد
      </button>
      <button
        type="button"
        className="pw-press | w-full h-14 bg-primary text-surface py-2 rounded-lg hover:bg-primary-2"
        onClick={() => handleClick("expense")}
      >
        افزودن هزینه
      </button>
    </div>
  );
};

export default NewForm;
