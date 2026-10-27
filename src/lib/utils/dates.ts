/**
 * Dates in the domain model are calendar days ("YYYY-MM-DD") with no time zone,
 * so everything here parses and compares them as local dates.
 */

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function parseDay(value: string): Date | null {
  const match = ISO_DAY.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const valid =
    date.getFullYear() === Number(y) &&
    date.getMonth() === Number(m) - 1 &&
    date.getDate() === Number(d);
  return valid ? date : null;
}

export function isValidDay(value: string): boolean {
  return parseDay(value) !== null;
}

export function toDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function today(): string {
  return toDay(new Date());
}

export function addDays(day: string, amount: number): string {
  const date = parseDay(day);
  if (!date) throw new Error(`Invalid day: ${day}`);
  date.setDate(date.getDate() + amount);
  return toDay(date);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function diffInDays(to: string, from: string = today()): number {
  const a = parseDay(to);
  const b = parseDay(from);
  if (!a || !b) return 0;
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

export type DeadlineState = "overdue" | "soon" | "upcoming" | "none";

/** `soon` means due today or within the next `soonWindow` days. */
export function deadlineState(
  day: string | null,
  now: string = today(),
  soonWindow = 3,
): DeadlineState {
  if (!day) return "none";
  const diff = diffInDays(day, now);
  if (diff < 0) return "overdue";
  return diff <= soonWindow ? "soon" : "upcoming";
}

export function formatDay(day: string): string {
  const date = parseDay(day);
  if (!date) return day;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function formatRelativeDay(day: string, now: string = today()): string {
  const diff = diffInDays(day, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  return `In ${diff} days`;
}

export function formatTimeAgo(timestamp: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDay(timestamp.slice(0, 10));
}
