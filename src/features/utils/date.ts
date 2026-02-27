import { CalendarItemDtov1 } from "@/lib/api";
import jalaali from "jalaali-js";

/**
 * Options for formatting functions.
 * timeZone affects:
 * - timeText (HH:mm)
 * - relative calculation boundaries (day/week/month/year)
 */
export type FormatOptions = {
  timeZone?: string; // default: "Asia/Baku"
};

export type RelativeUnit =
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export type RelativeInfo = {
  /**
   * Human-readable Persian relative text
   * e.g. "امروز" | "۵ روز قبل" | "یک هفته قبل" | "۲ ماه قبل"
   */
  text: string;
  /** Numeric value for the unit (kept as number for logic/filters) */
  value: number;
  /** The unit that value refers to */
  unit: RelativeUnit;
};

export type JalaliFormatResult = {
  /** e.g. "۱۵ تیر ۱۴۰۳" */
  dateText: string;
  /** e.g. "۰۹:۰۰" */
  timeText: string;
  /** Structured relative info for logic/UI */
  relative: RelativeInfo;
  /** e.g. "۱۵ تیر ۱۴۰۳ • ۰۹:۰۰ ۵ روز قبل" */
  fullText: string;
};

export type ShamsiDayItem = {
  /** Jalali day of month (1..31) */
  day_num: number;
  /** Short weekday label e.g. "ش" */
  day_label: string;
  /** True only for the middle item (today) */
  is_today: boolean;
};

/**
 * Compact version used by some UIs:
 * { date: "۱۰ اسفند", dueText: "۵ روز قبل" }
 */
export type CompactJalaliRelative = {
  date: string;
  dueText: string; // naming suggestion: "dueText" (works for past/future semantics)
};

export type DayWithPayments = ShamsiDayItem & {
  items: CalendarItemDtov1[];
};

// -----------------------------
// Persian digits / month names
// -----------------------------
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹" as const;

const toFaDigits = (input: string | number): string =>
  String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

const faMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

// -----------------------------
// Time formatting (HH:mm) in TZ
// -----------------------------
/**
 * Format time (HH:mm) in a given timezone using Persian locale digits.
 * Uses Intl to correctly apply timezone offsets.
 */
export function formatTimeHHmm(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("fa-IR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const h = parts.find((p) => p.type === "hour")?.value ?? "۰۰";
  const m = parts.find((p) => p.type === "minute")?.value ?? "۰۰";
  return `${h}:${m}`;
}

// -----------------------------
// Timezone-aware day/month logic
// -----------------------------
type YMD = { y: number; m: number; d: number };

/**
 * Extract YYYY-MM-DD of a Date as it appears in a given timezone.
 * Important for "calendar math" (today/yesterday/this month) in that TZ.
 */
export function getYMDInTZ(date: Date, timeZone: string): YMD {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);

  if (!y || !m || !d) throw new Error("Failed to compute date parts");
  return { y, m, d };
}

/**
 * Calendar-day difference in the given timezone.
 * Returns: (nowDate - targetDate) in days.
 * - past => positive
 * - today => 0
 * - future => negative
 */
export function dayDiffInTZ(target: Date, now: Date, timeZone: string): number {
  // Convert the timezone-derived YYYY-MM-DD to a UTC midnight timestamp.
  const toMidnightUTC = (ymd: YMD) =>
    Date.UTC(ymd.y, ymd.m - 1, ymd.d, 0, 0, 0, 0);

  const targetMidnight = toMidnightUTC(getYMDInTZ(target, timeZone));
  const nowMidnight = toMidnightUTC(getYMDInTZ(now, timeZone));

  return Math.round((nowMidnight - targetMidnight) / 86_400_000);
}

/**
 * Calendar-month difference between two YMDs (a -> b).
 * If b's day is earlier than a's day, we subtract 1 month (common UX rule).
 */
export function monthDiff(a: YMD, b: YMD): number {
  let months = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < a.d) months -= 1;
  return months;
}

// -----------------------------
// Relative text building
// -----------------------------
export function unitToFa(unit: RelativeUnit): string {
  switch (unit) {
    case "minute":
      return "دقیقه";
    case "hour":
      return "ساعت";
    case "day":
      return "روز";
    case "week":
      return "هفته";
    case "month":
      return "ماه";
    case "year":
      return "سال";
  }
}

/**
 * Build a structured relative result (text/value/unit).
 * - Uses timezone-aware day diff for day/week/month/year boundaries
 * - Uses plain ms diff for hours/minutes (within the same day)
 */
export function buildRelative(
  target: Date,
  now: Date,
  timeZone: string,
): RelativeInfo {
  const ms = now.getTime() - target.getTime();
  const isFuture = ms < 0;

  const dayDiff = dayDiffInTZ(target, now, timeZone); // positive=past, negative=future
  const absDayDiff = Math.abs(dayDiff);

  const a = getYMDInTZ(target, timeZone);
  const b = getYMDInTZ(now, timeZone);

  const months = Math.abs(monthDiff(a, b));
  const years = Math.floor(months / 12);

  const suffix = isFuture ? "بعد" : "قبل";

  const make = (value: number, unit: RelativeUnit): RelativeInfo => {
    const valueFa = toFaDigits(value);

    let text: string;
    // Special UX words
    if (unit === "day" && value === 0) text = "امروز";
    else if (unit === "day" && value === 1) text = isFuture ? "فردا" : "دیروز";
    else if (unit === "week" && value === 1) text = `یک هفته ${suffix}`;
    else if (unit === "month" && value === 1) text = `یک ماه ${suffix}`;
    else if (unit === "year" && value === 1) text = `یک سال ${suffix}`;
    else if (unit === "hour" && value === 1) text = `یک ساعت ${suffix}`;
    else if (unit === "minute" && value === 1) text = `یک دقیقه ${suffix}`;
    else text = `${valueFa} ${unitToFa(unit)} ${suffix}`;

    return { text, value, unit };
  };

  // Same calendar day (in TZ): show minutes/hours
  if (absDayDiff === 0) {
    return { text: "امروز", value: 0, unit: "day" };
  }

  // Day / week buckets
  if (absDayDiff < 7) return make(absDayDiff, "day");
  if (absDayDiff < 30) return make(Math.floor(absDayDiff / 7), "week");

  // Month / year buckets (calendar-aware)
  if (months < 12) return make(months, "month");
  return make(years, "year");
}

// -----------------------------
// Public API
// -----------------------------

/**
 * Full Jalali date + time + relative.
 * Example:
 * "۱۵ تیر ۱۴۰۳ • ۰۹:۰۰ ۵ روز قبل"
 */
export function formatJalaliWithRelative(
  isoString: string,
  options: FormatOptions = {},
): JalaliFormatResult {
  const timeZone = options.timeZone ?? "Asia/Baku";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime()))
    throw new Error(`Invalid date string: "${isoString}"`);

  const now = new Date();

  // NOTE:
  // We convert Gregorian -> Jalali using the date's JS components.
  // If you need Jalali conversion to respect the chosen timezone's calendar day,
  // we can convert using getYMDInTZ(date, timeZone) instead.
  const { jy, jm, jd } = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  const dateText = `${toFaDigits(jd)} ${faMonths[jm - 1]} ${toFaDigits(jy)}`;
  const timeText = formatTimeHHmm(date, timeZone);

  const relative = buildRelative(date, now, timeZone);
  const fullText = `${dateText} • ${timeText} ${relative.text}`;

  return { dateText, timeText, relative, fullText };
}

/**
 * 7-day strip centered on today: [-3..+3]
 * Output is Shamsi day-of-month + weekday label + is_today
 *
 * Note: weekday labels are based on the Gregorian Date's weekday,
 * which is correct for real-world weekdays.
 */
export function getCentered7DayStrip(
  now: Date = new Date(),
  labels: string[] = ["ش", "ی", "د", "س", "چ", "پ", "ج"], // Sat..Fri
): ShamsiDayItem[] {
  // Normalize to local midnight for stable "today"
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const out: ShamsiDayItem[] = [];

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);

    const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());

    // JS: 0=Sun..6=Sat
    // Persian labels array above is Sat..Fri
    const jsDay = d.getDay();
    const satBasedIndex = (jsDay + 1) % 7; // Sat=>0, Sun=>1, ... Fri=>6

    out.push({
      day_num: j.jd,
      day_label: labels[satBasedIndex] ?? String(satBasedIndex),
      is_today: offset === 0,
    });
  }

  return out;
}

/**
 * Compact formatter for cards / due dates:
 * Input: ISO datetime
 * Output:
 *  { date: "۱۰ اسفند", dueText: "۵ روز قبل" }
 *
 * Uses the same relative engine as formatJalaliWithRelative (timezone-aware).
 */
export function formatCompactJalaliDue(
  isoDateTime: string,
  options: FormatOptions = {},
): CompactJalaliRelative {
  const timeZone = options.timeZone ?? "Asia/Baku";

  const dateObj = new Date(isoDateTime);
  if (Number.isNaN(dateObj.getTime()))
    throw new Error(`Invalid date string: "${isoDateTime}"`);

  const now = new Date();

  const j = jalaali.toJalaali(
    dateObj.getFullYear(),
    dateObj.getMonth() + 1,
    dateObj.getDate(),
  );

  const date = `${toFaDigits(j.jd)} ${faMonths[j.jm - 1]}`;
  const dueText = buildRelative(dateObj, now, timeZone).text;

  return { date, dueText };
}

/**
 * Returns the subset of your week strip that:
 * - are the NEXT 3 days after today (tomorrow..+3)
 * - and have at least one item in the API response
 *
 * NOTE:
 * This matches by Jalali day-of-month (jd). This is safe for your 7-day strip window.
 */
export function getNext3DaysWithItems(
  weekStrip: ShamsiDayItem[],
  items: CalendarItemDtov1[] | undefined,
): DayWithPayments[] {
  if (!weekStrip?.length || !items?.length) return [];

  const todayIndex = weekStrip.findIndex((d) => d.is_today);
  if (todayIndex === -1) return [];

  // Tomorrow, +2, +3
  const next3 = weekStrip.slice(todayIndex + 1, todayIndex + 4);

  const result: DayWithPayments[] = [];

  for (const day of next3) {
    const matchingItems = items.filter((item) => {
      if (!item?.due_datetime) return false;

      const dt = new Date(item.due_datetime);
      if (Number.isNaN(dt.getTime())) return false;

      const j = jalaali.toJalaali(
        dt.getFullYear(),
        dt.getMonth() + 1,
        dt.getDate(),
      );

      return j.jd === day.day_num;
    });

    if (matchingItems.length > 0) {
      result.push({
        ...day,
        items: matchingItems,
      });
    }
  }

  return result;
}
