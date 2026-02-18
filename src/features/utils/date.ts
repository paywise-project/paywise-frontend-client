import jalaali from "jalaali-js";

type FormatOptions = {
  timeZone?: string; // default: "Asia/Baku"
};

type RelativeUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

export type RelativeInfo = {
  text: string; // e.g. "امروز" | "۵ روز قبل" | "۲ ماه قبل"
  value: number; // e.g. 5
  unit: RelativeUnit; // e.g. "day"
};

export type JalaliFormatResult = {
  dateText: string; // "۱۵ تیر ۱۴۰۳"
  timeText: string; // "۰۹:۰۰"
  relative: RelativeInfo;
  fullText: string; // "۱۵ تیر ۱۴۰۳ • ۰۹:۰۰ ۵ روز قبل"
};

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹" as const;

const faDigits = (input: string | number): string =>
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

// ---- Time formatting (HH:mm) in chosen TZ (Persian digits) ----
function formatTimeHHmm(date: Date, timeZone: string): string {
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

// ---- Helpers to get "now" and "date" in a timezone as components ----
type YMD = { y: number; m: number; d: number };

function getYMDInTZ(date: Date, timeZone: string): YMD {
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

function daysDiffInTZ(date: Date, now: Date, timeZone: string): number {
  // Normalize both to midnight of their derived YYYY-MM-DD in the timezone
  const toMidnightUTC = (ymd: YMD) =>
    Date.UTC(ymd.y, ymd.m - 1, ymd.d, 0, 0, 0, 0);

  const d1 = toMidnightUTC(getYMDInTZ(date, timeZone));
  const d2 = toMidnightUTC(getYMDInTZ(now, timeZone));
  return Math.round((d2 - d1) / 86_400_000);
}

function diffMonths(a: YMD, b: YMD): number {
  // months between a -> b (b is "now"). If b day is earlier than a day, subtract 1.
  let months = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < a.d) months -= 1;
  return months;
}

function buildRelative(date: Date, now: Date, timeZone: string): RelativeInfo {
  // Future support (optional): if date is in the future, flip wording.
  const ms = now.getTime() - date.getTime();
  const isFuture = ms < 0;

  const absMs = Math.abs(ms);
  const absMinutes = Math.floor(absMs / 60_000);
  const absHours = Math.floor(absMs / 3_600_000);

  // Use timezone-aware *calendar day* difference for day/week/month/year
  const dayDiff = Math.abs(daysDiffInTZ(date, now, timeZone));

  const a = getYMDInTZ(date, timeZone);
  const b = getYMDInTZ(now, timeZone);

  const months = Math.abs(diffMonths(a, b));
  const years = Math.floor(months / 12);

  const suffixPast = "قبل";
  const suffixFuture = "بعد"; // if you ever want "in X ..."
  const suffix = isFuture ? suffixFuture : suffixPast;

  const make = (value: number, unit: RelativeUnit): RelativeInfo => {
    const valueFa = faDigits(value);

    let text: string;
    if (unit === "day" && value === 0) text = "امروز";
    else if (unit === "day" && value === 1) text = isFuture ? "فردا" : "دیروز";
    else if (unit === "week" && value === 1) text = `یک هفته ${suffix}`;
    else if (unit === "month" && value === 1) text = `یک ماه ${suffix}`;
    else if (unit === "year" && value === 1) text = `یک سال ${suffix}`;
    else if (unit === "hour" && value === 1) text = `یک ساعت ${suffix}`;
    else if (unit === "minute" && value === 1) text = `یک دقیقه ${suffix}`;
    else text = `${valueFa} ${unitToFa(unit)} ${suffix}`;

    // For consistency, keep value numeric (English digits) in the object
    return { text, value, unit };
  };

  // --- Choose granularity ---
  // Same-day: go by hours/minutes if you want (or always say "امروز")
  if (dayDiff === 0) {
    if (absMinutes < 1) return make(0, "minute"); // "۰ دقیقه قبل" (rare)
    if (absMinutes < 60) return make(absMinutes, "minute");
    return make(absHours, "hour");
  }

  // Days up to ~3 weeks
  if (dayDiff < 7) return make(dayDiff, "day");
  if (dayDiff < 30) return make(Math.floor(dayDiff / 7), "week");

  // Months / Years (calendar-aware)
  if (months < 12) return make(months, "month");
  return make(years, "year");
}

function unitToFa(unit: RelativeUnit): string {
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

export function formatJalaliWithRelative(
  isoString: string,
  options: FormatOptions = {},
): JalaliFormatResult {
  const timeZone = options.timeZone ?? "Asia/Baku";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date string: "${isoString}"`);
  }

  const now = new Date();

  // Gregorian -> Jalali (based on JS Date's Y/M/D)
  const { jy, jm, jd } = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  const dateText = `${faDigits(jd)} ${faMonths[jm - 1]} ${faDigits(jy)}`;
  const timeText = formatTimeHHmm(date, timeZone);

  const relative = buildRelative(date, now, timeZone);
  const fullText = `${dateText} • ${timeText} ${relative.text}`;

  return { dateText, timeText, relative, fullText };
}
