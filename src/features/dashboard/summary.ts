import type { Task, TaskStatus } from "@/features/tasks/schemas";
import { TASK_STATUSES } from "@/features/tasks/schemas";
import { addDays, deadlineState, today } from "@/lib/utils/dates";

export interface TaskSummary {
  total: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
  /** Open tasks that are overdue or due within the window, soonest first. */
  upcoming: Task[];
}

/** All dashboard numbers derive from the task list; nothing is stored or hardcoded. */
export function summarizeTasks(tasks: Task[], now: string = today(), windowDays = 14): TaskSummary {
  const byStatus = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<
    TaskStatus,
    number
  >;
  for (const task of tasks) byStatus[task.status]++;

  const horizon = addDays(now, windowDays);
  const open = tasks.filter((t) => t.status !== "done" && t.dueDate !== null);
  const upcoming = open
    .filter((t) => t.dueDate !== null && t.dueDate <= horizon)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  return {
    total: tasks.length,
    byStatus,
    overdue: open.filter((t) => deadlineState(t.dueDate, now) === "overdue").length,
    upcoming,
  };
}
