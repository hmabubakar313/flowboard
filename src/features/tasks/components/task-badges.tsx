import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils/cn";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "../schemas";

export const TASK_STATUS_TONE: Record<TaskStatus, StatusTone> = {
  todo: "todo",
  in_progress: "progress",
  in_review: "review",
  done: "done",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <StatusBadge tone={TASK_STATUS_TONE[status]} label={TASK_STATUS_LABELS[status]} />;
}

const PRIORITY_BARS: Record<TaskPriority, { bars: number; color: string }> = {
  urgent: { bars: 4, color: "bg-priority-urgent" },
  high: { bars: 3, color: "bg-priority-high" },
  medium: { bars: 2, color: "bg-priority-medium" },
  low: { bars: 1, color: "bg-priority-low" },
};

/** Bars plus a text label, so priority never relies on colour alone. */
export function PriorityIndicator({ priority }: { priority: TaskPriority }) {
  const { bars, color } = PRIORITY_BARS[priority];
  return (
    <span className="text-ink-2 inline-flex items-center gap-2 text-sm whitespace-nowrap">
      <span aria-hidden="true" className="flex h-3.5 items-end gap-px">
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            style={{ height: `${level * 25}%` }}
            className={cn("w-[3px] rounded-[1px]", level <= bars ? color : "bg-line-strong")}
          />
        ))}
      </span>
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
