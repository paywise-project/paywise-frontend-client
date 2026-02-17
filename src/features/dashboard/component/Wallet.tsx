import { formatNumberFa } from "@/features/utils/numbers";
import React from "react";
import { HiArrowLongLeft } from "react-icons/hi2";

const Wallet = ({ type }: { type: "expense" | "income" }) => {
  return (
    <div>
      <div className="pw-card pw-press | flex items-center justify-between mb-5">
        <div>
          <h3 className="pw-label | text-muted">
            {type === "expense" ? "هزینه‌های این ماه" : "درآمدهای این ماه"}
          </h3>
          <h1
            className={`pw-title | ${type === "income" ? "text-primary" : "text-text"}`}
          >
            {formatNumberFa(15000000)} تومان
          </h1>
        </div>
        <span className="pw-icon-btn">
          <HiArrowLongLeft className="text-xl" />
        </span>
      </div>
    </div>
  );
};

export default Wallet;
