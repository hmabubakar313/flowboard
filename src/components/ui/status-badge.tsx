import { cn } from "@/lib/utils/cn";

export type StatusTone = "todo" | "progress" | "review" | "done" | "hold";

const TONES: Record<StatusTone, { dot: string; chip: string }> = {
  todo: { dot: "bg-status-todo", chip: "bg-status-todo-bg text-status-todo-ink" },
  progress: { dot: "bg-status-progress", chip: "bg-status-progress-bg text-status-progress-ink" },
  review: { dot: "bg-status-review", chip: "bg-status-review-bg text-status-review-ink" },
  done: { dot: "bg-status-done", chip: "bg-status-done-bg text-status-done-ink" },
  hold: { dot: "bg-status-hold", chip: "bg-status-hold-bg text-status-hold-ink" },
};

export function statusDotClass(tone: StatusTone): string {
  return TONES[tone].dot;
}

export function StatusBadge({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-2 text-xs font-medium whitespace-nowrap",
        TONES[tone].chip,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", TONES[tone].dot)} />
      {label}
    </span>
  );
}
