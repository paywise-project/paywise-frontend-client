"use client";

import { togglePanel, setPanelState } from "@/features/panel/slice/panelSlice";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import { Popover } from "@/features/shared/ui/Popover";
import { getNextShamsiMonths } from "@/features/utils/monthFinder";
import { formatNumberFa } from "@/features/utils/numbers";
import { CalendarItemDtov1 } from "@/lib/api";
import { apiRouterTypePaymentGetCalendarOptions } from "@/lib/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi2";

type Props = {
  monthsToShow?: number; // number of months shown (current + next months)
  onChangeAction?: (payload: {
    gregorianDate: Date;
    jy: number;
    jm: number;
    jd: number;
  }) => void;
  className?: string;
  popover: boolean;
};

type SelectedDay = {
  date: string; // "YYYY-MM-DD"
  items: CalendarItemDtov1[];
} | null;

type SelectedCell = {
  gregorianDate: Date; // "YYYY-MM-DD"
  jy: number;
  jm: number;
  jd: number;
};

const WEEKDAYS_FA_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const LOCALE = "fa-IR-u-ca-persian";

function faToEn(str: string) {
  return str
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function getJalaliParts(date: Date) {
  const fmt = new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(date);
  const yearStr = parts.find((p) => p.type === "year")?.value ?? "";
  const monthStr = parts.find((p) => p.type === "month")?.value ?? "";
  const dayStr = parts.find((p) => p.type === "day")?.value ?? "";
  return {
    jy: Number(faToEn(yearStr)),
    jm: Number(faToEn(monthStr)),
    jd: Number(faToEn(dayStr)),
  };
}

function getMonthTitle(date: Date) {
  return new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "long",
  }).format(date);
}

function getColumnIndex(date: Date) {
  return (date.getDay() + 1) % 7;
}

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

function jKey(jy: number, jm: number, jd: number) {
  return `${jy}-${jm}-${jd}`;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const toLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
};

type DayCell = { date: Date; jy: number; jm: number; jd: number };
type MonthModel = {
  title: string;
  monthKey: string;
  cells: Array<null | DayCell>;
};

function buildMonthModel(monthStartGuess: Date): MonthModel {
  // Find Gregorian date for Jalali day=1 of that guess's Jalali month
  const target = getJalaliParts(monthStartGuess);

  const first = new Date(monthStartGuess);
  let safety = 0;
  while (safety++ < 60) {
    const p = getJalaliParts(first);
    if (p.jy === target.jy && p.jm === target.jm && p.jd === 1) break;
    first.setDate(first.getDate() - 1);
  }

  const firstParts = getJalaliParts(first);
  const title = getMonthTitle(first);
  const monthKey = `${firstParts.jy}-${firstParts.jm}`;

  // collect days
  const days: DayCell[] = [];
  const cursor = new Date(first);
  safety = 0;
  while (safety++ < 40) {
    const p = getJalaliParts(cursor);
    if (p.jy !== firstParts.jy || p.jm !== firstParts.jm) break;
    days.push({ date: new Date(cursor), jy: p.jy, jm: p.jm, jd: p.jd });
    cursor.setDate(cursor.getDate() + 1);
  }

  const leading = days.length ? getColumnIndex(days[0].date) : 0;
  const cells: Array<null | DayCell> = [
    ...Array.from({ length: leading }, () => null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return { title, monthKey, cells };
}

export default function ShamsiDatePicker({
  monthsToShow = 1,
  onChangeAction,
  className = "",
  popover,
}: Props) {
  const { start, end } = getNextShamsiMonths(0, 12);

  const { customerUuid, isAuthenticated } = useAppSelector((s) => s.auth);

  const { data } = useQuery({
    ...apiRouterTypePaymentGetCalendarOptions({
      path: { user_uuid: customerUuid as string },
      query: {
        start_datetime: start,
        end_datetime: end,
      },
    }),

    enabled: isAuthenticated && !!customerUuid,
  });

  const dispatch = useAppDispatch();

  const itemsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarItemDtov1[]>();

    (data?.items ?? []).forEach((it) => {
      const key = it.due_datetime.slice(0, 10); // "YYYY-MM-DD"
      map.set(key, [...(map.get(key) ?? []), it]);
    });

    return map;
  }, [data]);

  const todayKey = useMemo(() => {
    const p = getJalaliParts(new Date());
    return jKey(p.jy, p.jm, p.jd);
  }, []);

  const [monthOffset, setMonthOffset] = useState(0);

  const [selected, setSelected] = useState<SelectedCell | null>();
  const [selectedDay, setSelectedDay] = React.useState<SelectedDay>(null);

  const [tooltip, setTooltip] = useState<{
    open: boolean;
    anchorEl: HTMLElement | null;
    payload: SelectedCell | null;
  }>({ open: false, anchorEl: null, payload: null });

  const months = useMemo(() => {
    const base = new Date(); // today (Gregorian)
    const arr: MonthModel[] = [];

    const count = Math.max(1, monthsToShow);

    for (let i = 0; i < count; i++) {
      const guess = new Date(base);
      guess.setMonth(guess.getMonth() + monthOffset + i);
      arr.push(buildMonthModel(guess));
    }

    return arr;
  }, [monthsToShow, monthOffset]);

  return (
    <div dir="rtl" lang="fa" className={["w-full", className].join(" ")}>
      <div
        className={[
          "grid gap-4",
          monthsToShow > 1 ? "md:grid-cols-2" : "",
        ].join(" ")}
      >
        {months.map((model) => {
          return (
            <div
              key={model.monthKey}
              className="pw-card | w-full max-w-[480px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className={`pw-icon-btn | flex items-center justify-center ${monthOffset === 0 ? "opacity-40 pointer-events-none" : ""}`}
                  onClick={() => setMonthOffset((v) => Math.max(0, v - 1))}
                >
                  <HiChevronDoubleRight />
                </button>
                <h3 className="text-lg font-semibold text-text text-center mb-4">
                  {months[0]?.title}
                </h3>
                <button
                  type="button"
                  className={`pw-icon-btn | flex items-center justify-center ${monthOffset === 11 ? "opacity-40 pointer-events-none" : ""}`}
                  onClick={() => setMonthOffset((v) => v + 1)}
                >
                  <HiChevronDoubleLeft />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  textAlign: "center",
                  gap: "0.25rem",
                }}
                className="mb-2 text-sm text-slate-500"
              >
                {WEEKDAYS_FA_SHORT.map((w) => (
                  <div key={w} className="py-1 text-muted">
                    {w}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: "0.25rem",
                }}
              >
                {model.cells.map((cell, i) => {
                  if (!cell)
                    return <div key={i} style={{ height: 50, width: 50 }} />;

                  const isSelected =
                    cell.jy === selected?.jy &&
                    cell.jm === selected?.jm &&
                    cell.jd === selected?.jd;

                  const isToday = jKey(cell.jy, cell.jm, cell.jd) === todayKey;

                  const cellKey = toLocalYMD(cell.date);

                  const items = itemsByDay.get(cellKey) ?? [];

                  const hasIncome = items.some(
                    (i) => i.payment_type === "INCOME",
                  );
                  const hasExpense = items.some(
                    (i) => i.payment_type === "EXPENSE",
                  );

                  const status =
                    hasIncome && hasExpense
                      ? "BOTH"
                      : hasIncome
                        ? "INCOME"
                        : hasExpense
                          ? "EXPENSE"
                          : "NONE";

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        const key = toLocalYMD(cell.date); // <- IMPORTANT

                        const payload: SelectedCell = {
                          gregorianDate: cell.date,
                          jy: cell.jy,
                          jm: cell.jm,
                          jd: cell.jd,
                        };

                        setSelected(payload);
                        onChangeAction?.(payload);

                        const dayItems = itemsByDay.get(key) ?? [];
                        setSelectedDay(
                          dayItems.length
                            ? { date: key, items: dayItems }
                            : null,
                        );

                        setTooltip({
                          open: true,
                          anchorEl: e.currentTarget,
                          payload,
                        });
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className={[
                        "rounded-xl border text-sm transition",
                        "gap-1 rounded-2xl border-none ",
                        isSelected
                          ? "bg-soft"
                          : isToday
                            ? "bg-primary text-surface hover:bg-primary-2"
                            : "text-text",
                      ].join(" ")}
                    >
                      <span className="leading-none w-full flex flex-col items-center justify-center">
                        {toFa(cell.jd)}
                      </span>
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
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reusable popover anchored to last clicked day */}
      {popover && (
        <Popover
          open={tooltip.open}
          onOpenChange={(v) => setTooltip((s) => ({ ...s, open: v }))}
          anchorEl={tooltip.anchorEl}
          placement="top"
          className="min-w-[220px]"
        >
          {selectedDay?.items?.length === 0 ? null : (
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
              )}
            </div>
          )}{" "}
        </Popover>
      )}
    </div>
  );
}
