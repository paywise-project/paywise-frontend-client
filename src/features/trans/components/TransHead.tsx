"use client";

import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import {
  setActiveTab,
  TransactionsTab,
} from "@/features/trans/slice/transSlice";

const TransHead = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.transactions.activeTab);
  const handleClick = (type: TransactionsTab) => {
    dispatch(setActiveTab(type));
  };
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-1 w-full">
        <h1 className="pw-title">تراکنش ها</h1>
      </div>
      <div className="pw-tabs mt-3 w-full">
        <div
          className={`pw-tab ${activeTab === "expense" ? "is-active" : ""}`}
          onClick={() => handleClick("expense")}
        >
          هزینه‌ها
        </div>

        <div
          className={`pw-tab ${activeTab === "income" ? "is-active" : ""}`}
          onClick={() => handleClick("income")}
        >
          درآمدها
        </div>
      </div>
    </div>
  );
};

export default TransHead;
