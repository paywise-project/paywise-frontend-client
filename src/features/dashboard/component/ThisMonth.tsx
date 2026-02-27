"use client";

import ShamsiDatePicker from "@/features/date/component/ShamsiDatePicker";
import SectionHeader from "@/features/shared/ui/SectionHeader";
import { HiCalendar } from "react-icons/hi2";

const ThisMonth = () => {
  return (
    <div className="mt-5">
      <SectionHeader text="تقویم سال" Emoji={HiCalendar} />
      <ShamsiDatePicker popover />
    </div>
  );
};

export default ThisMonth;
