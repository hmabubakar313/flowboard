import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "../schemas";

const PROJECT_STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  planning: "todo",
  active: "progress",
  on_hold: "hold",
  completed: "done",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <StatusBadge tone={PROJECT_STATUS_TONE[status]} label={PROJECT_STATUS_LABELS[status]} />;
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div aria-hidden="true" className="bg-sunken h-1.5 w-20 overflow-hidden rounded-full">
        <div className="bg-accent h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-ink-2 tabular text-sm whitespace-nowrap">
        {total === 0 ? "No tasks" : `${done} of ${total} done`}
      </span>
    </div>
  );
}
