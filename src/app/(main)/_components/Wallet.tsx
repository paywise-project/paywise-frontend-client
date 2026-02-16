import React from "react";
import {
  HiArrowTrendingDown,
  HiOutlineWallet,
  HiChevronLeft,
} from "react-icons/hi2";

const Wallet = () => {
  return (
    <div className="w-full flex flex-col items-center gap-4 mt-10">
      <h3 className="text-text-muted text-xl">خرجی این ماه</h3>
      <h1 className="text-black text-3xl font-bold">۳۱۳.۱۳ تومان</h1>
      <div className="flex items-center gap-1 text-black font-semibold">
        <HiArrowTrendingDown />
        <h3>۶۷٪ پایین تر از ماه قبل</h3>
      </div>
      <div className="ds-card bg-white mt-5 w-full py-3 flex items-center">
        <span className="ds-pill bg-text-muted/40 flex items-center justify-center w-14 h-14 ml-2">
          <HiOutlineWallet className="text-surface text-xl" />
        </span>
        <h2 className="text-surface text-xl">کیف پول خرجی</h2>
        <h2 className="text-surface flex-1 text-center font-bold">
          ۵۶۱۳.۵۰ تومان
        </h2>
        <HiChevronLeft className="text-surface text-xl" />
      </div>
    </div>
  );
};

export default Wallet;
