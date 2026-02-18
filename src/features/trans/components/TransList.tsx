"use client";

import { formatDayOfMonthText, formatNumberFa } from "@/features/utils/numbers";
import React from "react";
import type {
  SearchExpenseOutputDtov1,
  SearchIncomeOutputDtov1,
} from "@/lib/api";

type Props =
  | { tab: "expenses"; data: SearchExpenseOutputDtov1 }
  | { tab: "income"; data: SearchIncomeOutputDtov1 };

const TransList = (props: Props) => {
  if (props.tab === "expenses") {
    return (
      <>
        {props.data.expenses?.map((e) => (
          <div
            key={e.expense_uuid}
            className={`pw-card pw-press flex items-center justify-between gap-2 w-full ${!e.is_active && "opacity-60"}`}
          >
            <span className="pw-icon-btn">🏠</span>

            <span className="flex-1 w-full">
              <h3>{e.title}</h3>
              <span className="flex items-center gap-2">
                <p className="text-muted-2 text-xs">
                  {formatDayOfMonthText(e.day_of_month)}
                </p>
                {e.status_type === "PAID" && (
                  <p className="text-xs text-primary">پرداخت شده</p>
                )}
              </span>
            </span>

            <span>
              <h3>{formatNumberFa(e.amount)}</h3>
            </span>

            <span className="pw-icon-btn pw-btn--danger w-9 h-9">🗑</span>
          </div>
        ))}
      </>
    );
  }

  // income
  return (
    <>
      {props.data.incomes?.map((i) => (
        <div
          key={i.income_uuid}
          className={`pw-card pw-press flex items-center justify-between gap-2 w-full ${!i.is_active && "opacity-30"}`}
        >
          <span className="pw-icon-btn">🏠</span>

          <span className="flex-1 w-full">
            <h3>{i.title}</h3>
            <span className="flex items-center">
              <p className="text-muted-2 text-xs">
                {formatDayOfMonthText(i.day_of_month)}
              </p>
            </span>
          </span>

          <span>
            <h3>{formatNumberFa(i.amount)}</h3>
          </span>

          <span className="pw-icon-btn pw-btn--danger w-9 h-9">🗑</span>
        </div>
      ))}
    </>
  );
};

export default TransList;
