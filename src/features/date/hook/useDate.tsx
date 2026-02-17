import { useMemo } from "react";

export function useDate() {
  const today = useMemo(() => {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const parts = formatter.formatToParts(now);

    const weekday = parts.find((p) => p.type === "weekday")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const year = parts.find((p) => p.type === "year")?.value;

    return `${weekday}، ${day}، ${month}، ${year}`;
  }, []);

  return { today };
}
