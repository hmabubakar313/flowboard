"use client";

import { Avatar } from "@/components/ui/avatar";
import { Deadline } from "@/components/ui/deadline";
import { DropdownMenu, MenuItem } from "@/components/ui/dropdown-menu";
import { MoreIcon } from "@/components/ui/icons";
import { Select } from "@/components/ui/fields";
import type { Project } from "@/features/projects/schemas";
import type { Member } from "@/features/workspace/schemas";
import { TASK_STATUSES, TASK_STATUS_LABELS, type Task, type TaskStatus } from "../schemas";
import { PriorityIndicator } from "./task-badges";

interface TaskListProps {
  tasks: Task[];
  members: Map<string, Member>;
  /** Omit on a project page, where every task belongs to the same project. */
  projects?: Map<string, Project>;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

type RowProps = Omit<TaskListProps, "tasks"> & { task: Task };

function StatusSelect({ task, onStatusChange }: Pick<RowProps, "task" | "onStatusChange">) {
  return (
    <Select
      aria-label={`Status for ${task.title}`}
      value={task.status}
      onChange={(event) => {
        const next = TASK_STATUSES.find((status) => status === event.target.value);
        if (next) onStatusChange(task, next);
      }}
      className="h-8 py-0 pl-2.5 text-sm"
    >
      {TASK_STATUSES.map((status) => (
        <option key={status} value={status}>
          {TASK_STATUS_LABELS[status]}
        </option>
      ))}
    </Select>
  );
}

function Assignee({ member }: { member: Member | undefined }) {
  if (!member) return <span className="text-ink-3">Unassigned</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar name={member.name} size="sm" />
      <span className="truncate">{member.name}</span>
    </span>
  );
}

function TaskActions({ task, onEdit, onDelete }: Pick<RowProps, "task" | "onEdit" | "onDelete">) {
  return (
    <DropdownMenu
      label={`Actions for ${task.title}`}
      triggerClassName="inline-flex size-8 items-center justify-center rounded-control text-ink-3 hover:bg-sunken hover:text-ink"
      trigger={<MoreIcon />}
    >
      <MenuItem onClick={() => onEdit(task)}>Edit task</MenuItem>
      <MenuItem tone="danger" onClick={() => onDelete(task)}>
        Delete task
      </MenuItem>
    </DropdownMenu>
  );
}

function TaskTitle({
  task,
  project,
  onEdit,
}: {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
}) {
  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="rounded-control max-w-full truncate text-left font-medium hover:underline"
      >
        {task.title}
      </button>
      <p className="text-ink-3 truncate text-sm">
        <span className="font-mono text-xs">#{task.number}</span>
        {project ? <> · {project.name}</> : null}
      </p>
    </div>
  );
}

export function TaskList({
  tasks,
  members,
  projects,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskListProps) {
  return (
    <>
      <table className="hidden w-full text-left @min-[56rem]:table">
        <caption className="sr-only">Tasks</caption>
        <thead>
          <tr className="border-line text-ink-3 border-b text-xs font-medium tracking-wide uppercase">
            <th scope="col" className="py-2.5 pl-4 font-medium">
              Task
            </th>
            <th scope="col" className="w-40 px-3 font-medium">
              Status
            </th>
            <th scope="col" className="w-28 px-3 font-medium">
              Priority
            </th>
            <th scope="col" className="w-44 px-3 font-medium">
              Assignee
            </th>
            <th scope="col" className="w-40 px-3 font-medium">
              Due
            </th>
            <th scope="col" className="w-12 pr-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-line hover:bg-hover border-b last:border-b-0">
              <td className="max-w-0 py-2.5 pl-4">
                <TaskTitle task={task} project={projects?.get(task.projectId)} onEdit={onEdit} />
              </td>
              <td className="px-3">
                <StatusSelect task={task} onStatusChange={onStatusChange} />
              </td>
              <td className="px-3">
                <PriorityIndicator priority={task.priority} />
              </td>
              <td className="max-w-0 px-3">
                <Assignee member={task.assigneeId ? members.get(task.assigneeId) : undefined} />
              </td>
              <td className="px-3">
                <Deadline day={task.dueDate} muted={task.status === "done"} />
              </td>
              <td className="pr-3 text-right">
                <TaskActions task={task} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-line divide-y @min-[56rem]:hidden">
        {tasks.map((task) => (
          <li key={task.id} className="flex flex-col gap-2.5 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <TaskTitle task={task} project={projects?.get(task.projectId)} onEdit={onEdit} />
              <div className="-mt-1 -mr-2 shrink-0">
                <TaskActions task={task} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="w-36">
                <StatusSelect task={task} onStatusChange={onStatusChange} />
              </div>
              <PriorityIndicator priority={task.priority} />
              <Deadline day={task.dueDate} muted={task.status === "done"} />
              <Assignee member={task.assigneeId ? members.get(task.assigneeId) : undefined} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
