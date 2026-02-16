import { useDate } from "@/features/date/hook/useDate";
import React from "react";

import {
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

const Header = () => {
  const { today } = useDate();

  return (
    <div className="flex items-center justify-between pt-5">
      <span className="ds-pill bg-white flex items-center justify-center w-14 h-14">
        <HiOutlineCog6Tooth className="text-brand text-3xl" />
      </span>
      <span className="flex items-center justify-center gap-4 text-lg">
        {today}
        <HiOutlineCalendarDays className="text-xl" />
      </span>
      <span className="ds-pill bg-white flex items-center justify-center w-14 h-14">
        <HiOutlineBell className="text-brand text-3xl" />
      </span>
    </div>
  );
};

export default Header;
