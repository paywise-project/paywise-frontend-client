"use client";

import { setPanelState, togglePanel } from "@/features/panel/slice/panelSlice";
import { usePopover } from "@/features/shared/hook/usePopover";
import { useAppDispatch } from "@/features/shared/redux/hooks";
import { Popover } from "@/features/shared/ui/Popover";
import {
  DayWithPayments,
  getCentered7DayStrip,
  getNext3DaysWithItems,
} from "@/features/utils/date";
import { formatNumberFa } from "@/features/utils/numbers";
import { CalendarItemDtov1 } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

const WeeklyCalendar = ({
  date,
}: {
  date: CalendarItemDtov1[] | undefined;
}) => {
  const [selectedDay, setSelectedDay] = useState<{
    day_num: number;
    day_label: string;
    items: CalendarItemDtov1[];
  } | null>(null);

  const dispatch = useAppDispatch();

  const thisWeek = getCentered7DayStrip();
  const todayIndex = thisWeek.findIndex((d) => d.is_today);

  const paymentDays: DayWithPayments[] = getNext3DaysWithItems(thisWeek, date);
  const paymentDayMap = new Map(paymentDays.map((d) => [d.day_num, d.items]));

  const pop = usePopover();

  return (
    <div className="flex items-center justify-between gap-1 mb-4">
      {thisWeek.map((d, i) => {
        const itemsForDay = paymentDayMap.get(d.day_num) ?? [];

        const incomeItems = itemsForDay.filter(
          (item) => item.payment_type === "INCOME",
        );
        const expenseItems = itemsForDay.filter(
          (item) => item.payment_type === "EXPENSE",
        );

        const hasIncome = incomeItems.length > 0;
        const hasExpense = expenseItems.length > 0;

        const isPrevDay = todayIndex !== -1 && i < todayIndex;
        const disablePopover = isPrevDay;

        const status =
          hasIncome && hasExpense
            ? "BOTH"
            : hasIncome
              ? "INCOME"
              : hasExpense
                ? "EXPENSE"
                : "NONE";

        return (
          <div
            className={`pw-icon-btn pw-press | flex flex-col items-center justify-center ${d.is_today ? "bg-primary-2 mx-2 w-14 h-14" : "bg-surface w-12 h-12"} shadow-card ${disablePopover ? "opacity-50 pointer-events-none" : ""}`}
            key={d.day_num}
            onClick={(e) => {
              if (disablePopover) return;

              setSelectedDay({
                day_num: d.day_num,
                day_label: d.day_label,
                items: itemsForDay,
              });
              pop.toggleAt(e.currentTarget);
            }}
          >
            <p className={`${d.is_today ? "text-surface" : "text-xs"}`}>
              {formatNumberFa(d.day_num)}
            </p>
            <p className={`${d.is_today ? "text-surface" : "text-xs"}`}>
              {d.day_label}
            </p>
            {status === "EXPENSE" ? (
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  backgroundColor: "var(--color-loan)",
                  borderRadius: 999,
                }}
              />
            ) : status === "INCOME" ? (
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  backgroundColor: "var(--color-salary)",
                  borderRadius: 999,
                }}
              />
            ) : status === "BOTH" ? (
              <span className="flex items-center gap-1">
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    backgroundColor: "var(--color-loan)",
                    borderRadius: 999,
                  }}
                />
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    backgroundColor: "var(--color-salary)",
                    borderRadius: 999,
                  }}
                />
              </span>
            ) : (
              ""
            )}{" "}
          </div>
        );
      })}
      <Popover
        open={pop.open}
        onOpenChange={pop.setOpen}
        anchorEl={pop.anchorEl}
      >
        {!selectedDay ? (
          <div className="text-sm">هیچ آیتمی نیست</div>
        ) : selectedDay?.items?.length === 0 ? (
          <>
            <button
              className={`
          w-full rounded-xl p-2 mb-1 shadow-header text-sm transition
          bg-loan text-surface hover:bg-loan/60
        `}
              onClick={() => {
                dispatch(togglePanel());
                dispatch(setPanelState("expense"));
              }}
            >
              + افزودن مخارج
            </button>
            <button
              className={`
          w-full rounded-xl p-2 shadow-header text-sm transition
          bg-salary text-surface hover:bg-salary/60
        `}
              onClick={() => {
                dispatch(togglePanel());
                dispatch(setPanelState("income"));
              }}
            >
              + افزودن درآمد
            </button>
          </>
        ) : (
          <div className="min-w-[260px]">
            {selectedDay?.items?.length ? (
              (() => {
                const incomeItems = selectedDay.items.filter(
                  (i) => i.payment_type === "INCOME",
                );
                const expenseItems = selectedDay.items.filter(
                  (i) => i.payment_type === "EXPENSE",
                );

                const totalIncome = incomeItems.reduce(
                  (sum, i) => sum + i.amount,
                  0,
                );
                const totalExpense = expenseItems.reduce(
                  (sum, i) => sum + i.amount,
                  0,
                );

                return (
                  <div className="flex flex-col gap-3">
                    {/* Income Section */}
                    {incomeItems.length > 0 && (
                      <div className="rounded-2xl bg-bg p-3 border-3 border-primary-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-salary" />
                            <span className="text-sm text-muted">درآمد</span>
                          </div>
                          <span className="text-base font-bold text-salary">
                            {formatNumberFa(totalIncome)} تومان
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Expense Section */}
                    {expenseItems.length > 0 && (
                      <div className="rounded-2xl bg-bg p-3 border-3 border-loan">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-loan" />
                            <span className="text-sm text-muted">هزینه</span>
                          </div>
                          <span className="text-base font-bold text-loan">
                            {formatNumberFa(totalExpense)} تومان
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-4 text-muted text-sm">
                <span className="text-2xl mb-2">📭</span>
                امروز تراکنشی ثبت نشده
              </div>
            )}
          </div>
        )}{" "}
      </Popover>
    </div>
  );
};

export default WeeklyCalendar;
