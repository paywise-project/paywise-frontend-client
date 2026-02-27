"use client";

import SectionHeader from "@/features/shared/ui/SectionHeader";
import Spinner from "@/features/shared/ui/Spinner";
import TypeIcon from "@/features/shared/ui/TypeIcon";
import { formatCompactJalaliDue } from "@/features/utils/date";
import { formatNumberFa } from "@/features/utils/numbers";
import { GetUpcomingPaymentOutputDtov1 } from "@/lib/api";
import { HiOutlineClock, HiOutlineFaceSmile } from "react-icons/hi2";

const PaymentDue = ({
  payment,
}: {
  payment: GetUpcomingPaymentOutputDtov1 | undefined;
}) => {
  let date;
  if (payment?.due_datetime) {
    date = formatCompactJalaliDue(payment?.due_datetime ?? "");
  }

  return (
    <div className="mt-5">
      <SectionHeader text="پرداخت بعدی" Emoji={HiOutlineClock} />
      <div className="pw-card pw-press | ">
        {payment ? (
          <div className="flex items-center gap-3">
            <TypeIcon type={payment?.category_type ?? "OTHER"} />

            <div className="font-semibold">
              <p>{payment?.title}</p>

              <div className="text-base text-muted flex items-center gap-2">
                <p className="text-muted">{date?.date}</p>
                <p className="text-muted-2"> • </p>
                <p className="text-danger">{date?.dueText}</p>
              </div>
            </div>
            <h2 className="pw-title | flex-1 text-left">
              {formatNumberFa(payment?.amount ?? 0)} تومان
            </h2>
          </div>
        ) : (
          <div className=" flex items-center gap-1">
            <HiOutlineFaceSmile className="text-3xl text-primary" />
            <p className="pw-title | text-text">پرداختی ندارید.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDue;
