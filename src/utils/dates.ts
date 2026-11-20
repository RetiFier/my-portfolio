/**
 * Date helpers for ISO "YYYY-MM" strings stored in YAML.
 * Parsing is manual (not `new Date("Aug 2019")`) so results are identical
 * across browsers and between server rendering and the client.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface YearMonth {
  year: number;
  month: number; // 1-12
}

export const parseYearMonth = (value: string): YearMonth => {
  const [y, m] = value.split("-").map((part) => parseInt(part, 10));
  return { year: y, month: Number.isFinite(m) ? m : 1 };
};

export const currentYearMonth = (now: Date = new Date()): YearMonth => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
});

/** Months as a continuous number, useful for positioning on a timeline. */
export const toMonthIndex = ({ year, month }: YearMonth): number => year * 12 + (month - 1);

export const formatYearMonth = (value: string): string => {
  const { year, month } = parseYearMonth(value);
  return `${MONTHS[month - 1]} ${year}`;
};

/** Inclusive month count, matching how LinkedIn reports durations. */
export const monthsBetween = (from: string, to: string | null, now?: Date): number => {
  const start = toMonthIndex(parseYearMonth(from));
  const end = to ? toMonthIndex(parseYearMonth(to)) : toMonthIndex(currentYearMonth(now));
  return Math.max(1, end - start + 1);
};

export const formatDuration = (months: number): string => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ");
};

export interface RoleDates {
  fromDate: string;
  toDate: string | null;
  current: boolean | null;
}

/** "Apr 2023 – Sep 2025", "Jan 2026 – Present", or "Started Apr 2022" when no end is confirmed. */
export const formatRange = ({ fromDate, toDate, current }: RoleDates): string => {
  const start = formatYearMonth(fromDate);
  if (toDate) return `${start} – ${formatYearMonth(toDate)}`;
  if (current) return `${start} – Present`;
  return `Started ${start}`;
};

/** Duration label, or null when the end date is not confirmed. */
export const roleDuration = (role: RoleDates, now?: Date): string | null => {
  if (!role.toDate && !role.current) return null;
  return formatDuration(monthsBetween(role.fromDate, role.toDate, now));
};

/** Whole years since the given ISO month, e.g. "2019-08" -> 7 in late 2026. */
export const yearsSince = (from: string, now?: Date): number =>
  Math.floor((monthsBetween(from, null, now) - 1) / 12);
