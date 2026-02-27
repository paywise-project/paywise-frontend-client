"use client";

import { formatNumberFa } from "@/features/utils/numbers";
import { GetBalanceOutputDtov1 } from "@/lib/api";
import {
  HiOutlineBanknotes,
  HiOutlineCircleStack,
  HiOutlineCreditCard,
} from "react-icons/hi2";

const Wallet = ({
  balance,
}: {
  balance: GetBalanceOutputDtov1 | undefined;
}) => {
  return (
    <div>
      <div className="pw-card pw-press | flex items-center justify-around mb-5 text-text font-semibold">
        <span className="flex flex-col items-center gap-1">
          <HiOutlineBanknotes className="text-3xl text-primary" />
          <p className="text-sm"> کل دارایی</p>
          <p className="text-lg">{formatNumberFa(balance?.balance ?? 0)}</p>
        </span>
        <span className="flex flex-col items-center gap-1">
          <HiOutlineCircleStack className="text-3xl text-primary" />
          <p className="text-sm">کل درآمد</p>
          <p className="text-lg">
            {" "}
            {formatNumberFa(balance?.total_income ?? 0)}
          </p>
        </span>{" "}
        <span className="flex flex-col items-center gap-1">
          <HiOutlineCreditCard className="text-3xl text-primary" />
          <p className="text-sm">کل مخارج</p>
          <p className="text-lg">
            {" "}
            {formatNumberFa(balance?.total_expense ?? 0)}
          </p>
        </span>
      </div>
    </div>
  );
};

export default Wallet;
