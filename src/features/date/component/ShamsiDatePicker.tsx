"use client";

import React, { useMemo, useState } from "react";

type DotColor = "red" | "green";
type MarkedDays = Record<number, DotColor>;

type Props = {
  markedDays?: MarkedDays; // key: day-of-month in current shown month
  onChange?: (payload: {
    gregorianDate: Date;
    jy: number;
    jm: number;
    jd: number;
  }) => void;
  className?: string;
};

const WEEKDAYS_FA_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"]; // Sat..Fri
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

// JS getDay: Sun=0..Sat=6 -> our columns: Sat=0..Fri=6
function getColumnIndex(date: Date) {
  return (date.getDay() + 1) % 7;
}

function toFa(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

function jKey(jy: number, jm: number, jd: number) {
  return `${jy}-${jm}-${jd}`;
}

type DayCell = {
  date: Date;
  jy: number;
  jm: number;
  jd: number;
};

export default function ShamsiDatePicker({
  markedDays = {},
  onChange,
  className = "",
}: Props) {
  // compute "today key" once per mount (good enough for most UIs)
  const todayKey = useMemo(() => {
    const p = getJalaliParts(new Date());
    return jKey(p.jy, p.jm, p.jd);
  }, []);

  const [selected, setSelected] = useState(() => {
    const p = getJalaliParts(new Date());
    return { jy: p.jy, jm: p.jm, jd: p.jd };
  });

  const model = useMemo(() => {
    const now = new Date();
    const nowParts = getJalaliParts(now);

    // 1) Find Gregorian date for Jalali day=1 of current Jalali month
    let first = new Date(now);
    let safety = 0;

    while (safety++ < 60) {
      const p = getJalaliParts(first);
      if (p.jy === nowParts.jy && p.jm === nowParts.jm && p.jd === 1) break;
      first.setDate(first.getDate() - 1);
    }

    const firstParts = getJalaliParts(first);
    const title = getMonthTitle(first);

    // 2) Collect all days in this Jalali month
    const days: DayCell[] = [];
    let cursor = new Date(first);
    safety = 0;

    while (safety++ < 40) {
      const p = getJalaliParts(cursor);
      if (p.jy !== firstParts.jy || p.jm !== firstParts.jm) break;

      days.push({
        date: new Date(cursor),
        jy: p.jy,
        jm: p.jm,
        jd: p.jd,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    // 3) Leading blanks so day 1 lands in correct weekday column
    const leading = days.length ? getColumnIndex(days[0].date) : 0;

    const cells: Array<null | DayCell> = [
      ...Array.from({ length: leading }, () => null),
      ...days,
    ];

    while (cells.length % 7 !== 0) cells.push(null);

    return { title, cells };
  }, []);

  return (
    <div
      dir="rtl"
      lang="fa"
      className={[
        "pw-card | w-full max-w-[480px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div
        style={{ marginBottom: 16 }}
        className="text-lg font-semibold text-text text-center"
      >
        {model.title}
      </div>

      {/* Weekdays */}
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
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: "0.25rem",
        }}
      >
        {model.cells.map((cell, i) => {
          if (!cell) return <div key={i} style={{ height: 50, width: 50 }} />;

          const isSelected =
            cell.jy === selected.jy &&
            cell.jm === selected.jm &&
            cell.jd === selected.jd;

          const isToday = jKey(cell.jy, cell.jm, cell.jd) === todayKey;

          const dot = markedDays[cell.jd];

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelected({ jy: cell.jy, jm: cell.jm, jd: cell.jd });
                onChange?.({
                  gregorianDate: cell.date,
                  jy: cell.jy,
                  jm: cell.jm,
                  jd: cell.jd,
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
                "gap-1 rounded-2xl border-none hover:bg-slate-100",

                isToday && !isSelected
                  ? "bg-primary text-surface rounded-lg"
                  : "",
              ].join(" ")}
            >
              <span className="leading-none w-full h-[50px] flex flex-col items-center justify-center">
                {toFa(cell.jd)}
                {dot !== undefined && (
                  <span
                    style={{
                      height: 6,
                      width: 6,
                      backgroundColor:
                        dot === "red"
                          ? "#ff6b6b"
                          : dot === "green"
                            ? "#15967d"
                            : "bg-transparent",
                      borderRadius: 9999,
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
