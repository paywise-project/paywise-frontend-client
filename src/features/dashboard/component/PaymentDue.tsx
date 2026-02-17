import SectionHeader from "@/features/shared/ui/SectionHeader";
import React from "react";

const PaymentDue = () => {
  return (
    <div className="mt-5">
      <SectionHeader
        text="پرداخت بعدی"
        emoji="⏰
"
      />
      <div className="pw-card pw-press | ">
        <div className="flex items-center gap-3 mb-3">
          <span className="pw-icon-btn | w-12 h-12 text-2xl bg-soft-brown">
            🏠
          </span>
          <div className="font-semibold">
            <p>اجاره منزل</p>

            <div className="text-base text-muted flex items-center gap-2">
              <p>۱۵ تیر</p>
              <p> • </p>
              <p className="text-danger">۵ روز دیگر</p>
            </div>
          </div>
        </div>
        <div className="w-full text-left">
          <h2 className="pw-title">۵,۰۰۰,۰۰۰ تومان</h2>
        </div>
      </div>
    </div>
  );
};

export default PaymentDue;
