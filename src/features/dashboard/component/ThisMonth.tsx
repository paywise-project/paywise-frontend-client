"use client";

import ShamsiDatePicker from "@/features/date/component/ShamsiDatePicker";
import SectionHeader from "@/features/shared/ui/SectionHeader";
import React from "react";

const ThisMonth = () => {
  return (
    <div className="mt-5">
      <SectionHeader text="تقویم تیر ماه" emoji="📅" />
      <ShamsiDatePicker
        markedDays={{
          3: "red",
          7: "green",
          12: "red",
          18: "green",
        }}
        onChange={({ jy, jm, jd }) => {
          console.log("Selected Jalali:", jy, jm, jd);
        }}
      />
    </div>
  );
};

export default ThisMonth;
