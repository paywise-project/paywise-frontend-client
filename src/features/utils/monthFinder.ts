import jalaali from "jalaali-js";

type JalaliParts = { jy: number; jm: number; jd: number };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODateYYYYMMDD(gy: number, gm: number, gd: number) {
  return `${gy}-${pad2(gm)}-${pad2(gd)}`;
}

/** Add N months in Jalali calendar (handles year rollover). */
function addJalaliMonths(
  { jy, jm }: Pick<JalaliParts, "jy" | "jm">,
  deltaMonths: number,
) {
  const total = jy * 12 + (jm - 1) + deltaMonths;
  const newJy = Math.floor(total / 12);
  const newJm = (((total % 12) + 12) % 12) + 1; // 1..12
  return { jy: newJy, jm: newJm };
}

/** First day of Jalali month -> Gregorian ISO date (YYYY-MM-DD). */
export function jalaliMonthStartToGregorianISO(jy: number, jm: number): string {
  const g = jalaali.toGregorian(jy, jm, 1);
  return toISODateYYYYMMDD(g.gy, g.gm, g.gd);
}

/** Last day of Jalali month -> Gregorian ISO date (YYYY-MM-DD). */
export function jalaliMonthEndToGregorianISO(jy: number, jm: number): string {
  const last = jalaali.jalaaliMonthLength(jy, jm);
  const g = jalaali.toGregorian(jy, jm, last);
  return toISODateYYYYMMDD(g.gy, g.gm, g.gd);
}

/**
 * From "now", get:
 * - start: first day of Jalali month at startOffsetMonths
 * - end: last day of Jalali month at endOffsetMonths
 *
 * Example:
 *   startOffsetMonths=0  => first of this Jalali month
 *   endOffsetMonths=3    => end of (this + 3) Jalali months
 */
export function getNextShamsiMonths(
  startOffsetMonths: number,
  endOffsetMonths: number,
  now: Date = new Date(),
): { start: string; end: string } {
  // Use local date parts; if you want it based on a specific timezone,
  // pass in a Date already representing that local time.
  const gy = now.getFullYear();
  const gm = now.getMonth() + 1;
  const gd = now.getDate();

  const currentJ = jalaali.toJalaali(gy, gm, gd); // { jy, jm, jd }

  const startMonth = addJalaliMonths(
    { jy: currentJ.jy, jm: currentJ.jm },
    startOffsetMonths,
  );
  const endMonth = addJalaliMonths(
    { jy: currentJ.jy, jm: currentJ.jm },
    endOffsetMonths,
  );

  return {
    start: jalaliMonthStartToGregorianISO(startMonth.jy, startMonth.jm),
    end: jalaliMonthEndToGregorianISO(endMonth.jy, endMonth.jm),
  };
}

/**
 * If you want multiple months as a list of start/end (Gregorian ISO):
 * count=4, offset=0 => this Jalali month + next 3 months
 */
export function getNextJalaliMonthsBoundariesGregorianISOFromNow(
  count: number,
  offsetMonths: number = 0,
  now: Date = new Date(),
): Array<{ start: string; end: string }> {
  const gy = now.getFullYear();
  const gm = now.getMonth() + 1;
  const gd = now.getDate();

  const currentJ = jalaali.toJalaali(gy, gm, gd);

  return Array.from({ length: count }, (_, i) => {
    const m = addJalaliMonths(
      { jy: currentJ.jy, jm: currentJ.jm },
      offsetMonths + i,
    );
    return {
      start: jalaliMonthStartToGregorianISO(m.jy, m.jm),
      end: jalaliMonthEndToGregorianISO(m.jy, m.jm),
    };
  });
}
