import { cn } from "@/lib/utils/cn";
import { deadlineState, formatDay, formatRelativeDay } from "@/lib/utils/dates";

/** A due date that flags itself in text (not just colour) when overdue or imminent. */
export function Deadline({ day, muted = false }: { day: string | null; muted?: boolean }) {
  if (!day) return <span className="text-ink-3">No date</span>;
  const state = muted ? "none" : deadlineState(day);
  return (
    <span
      className={cn(
        "tabular whitespace-nowrap",
        state === "overdue" && "text-danger font-medium",
        state === "soon" && "text-status-progress-ink font-medium",
        (state === "none" || state === "upcoming") && "text-ink-2",
      )}
    >
      {formatDay(day)}
      {state === "overdue" || state === "soon" ? (
        <span className="text-xs font-normal"> · {formatRelativeDay(day)}</span>
      ) : null}
    </span>
  );
}
