"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { QueryState } from "@/components/feedback/query-state";
import { SearchInput } from "@/components/forms/search-input";
import { Button, buttonClasses } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";
import { PlusIcon, SearchIcon, TasksIcon } from "@/components/ui/icons";
import { Panel } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useProjects } from "@/features/projects/hooks";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { useMembers } from "@/features/workspace/hooks";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { getErrorMessage } from "@/lib/api";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTasks, useUpdateTaskStatus } from "../hooks";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  taskPrioritySchema,
  taskStatusSchema,
  type Task,
} from "../schemas";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskList } from "./task-list";

const FILTER_KEYS = ["q", "status", "priority", "assignee", "project"] as const;

/** Filterable task list with create, edit, status change and delete. Pass projectId to scope it. */
export function TasksView({ projectId }: { projectId?: string }) {
  const { workspace } = useWorkspace();
  const toast = useToast();
  const { values, setFilters, hasActiveFilters } = useUrlFilters(FILTER_KEYS);
  const [searchKey, setSearchKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const { data: members = [] } = useMembers();
  const projectsQuery = useProjects({ workspaceId: workspace.id });
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const query = useTasks({
    workspaceId: workspace.id,
    projectId: projectId ?? (values.project || undefined),
    search: values.q || undefined,
    status: taskStatusSchema.safeParse(values.status).data,
    priority: taskPrioritySchema.safeParse(values.priority).data,
    assigneeId: values.assignee || undefined,
  });
  const changeStatus = useUpdateTaskStatus();

  const clearFilters = () => {
    setFilters({ q: "", status: "", priority: "", assignee: "", project: "" });
    setSearchKey((key) => key + 1);
  };

  const activeFilterCount = [
    values.status,
    values.priority,
    values.assignee,
    values.project,
  ].filter(Boolean).length;
  const hasProjects = projects.length > 0;
  const newTask = hasProjects ? (
    <Button variant="primary" onClick={() => setCreating(true)}>
      <PlusIcon /> New task
    </Button>
  ) : null;

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="flex gap-2 lg:contents">
          <SearchInput
            key={searchKey}
            label="Search tasks"
            placeholder="Search tasks"
            initialValue={values.q}
            onSearch={(q) => setFilters({ q })}
          />
          <Button
            className="sm:hidden"
            aria-expanded={filtersOpen}
            aria-controls="task-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </div>
        <div
          id="task-filters"
          className={`${filtersOpen ? "grid" : "hidden"} grid-cols-2 gap-2 sm:grid sm:grid-cols-3 lg:flex lg:flex-1 lg:[&>div]:w-36 lg:[&>div]:shrink-0`}
        >
          <Select
            aria-label="Filter by status"
            value={values.status}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by priority"
            value={values.priority}
            onChange={(e) => setFilters({ priority: e.target.value })}
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by assignee"
            value={values.assignee}
            onChange={(e) => setFilters({ assignee: e.target.value })}
          >
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
          {projectId ? null : (
            <Select
              aria-label="Filter by project"
              value={values.project}
              onChange={(e) => setFilters({ project: e.target.value })}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="lg:ml-auto">{newTask}</div>
      </div>

      <Panel className="@container">
        <QueryState
          query={query}
          errorTitle="Couldn't load tasks"
          skeleton={
            <div className="flex flex-col gap-4 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          }
          isEmpty={(tasks) => tasks.length === 0}
          empty={
            hasActiveFilters ? (
              <EmptyState
                icon={<SearchIcon />}
                title="No tasks match your filters"
                description="Try removing a filter or searching for something else."
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            ) : hasProjects ? (
              <EmptyState
                icon={<TasksIcon />}
                title="No tasks yet"
                description="Add the first task to start tracking work."
                action={newTask}
              />
            ) : (
              <EmptyState
                icon={<TasksIcon />}
                title="Create a project first"
                description="Tasks live inside projects, so you'll need at least one before adding tasks."
                action={
                  <Link href="/projects" className={buttonClasses("primary")}>
                    Go to projects
                  </Link>
                }
              />
            )
          }
        >
          {(tasks) => (
            <TaskList
              tasks={tasks}
              members={membersById}
              projects={projectId ? undefined : projectsById}
              onStatusChange={(task, status) =>
                changeStatus.mutate(
                  { id: task.id, status },
                  {
                    onError: (error) =>
                      toast.error(`Couldn't update “${task.title}”. ${getErrorMessage(error)}`),
                  },
                )
              }
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          )}
        </QueryState>
      </Panel>

      <TaskFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        projects={projects}
        members={members}
        defaultProjectId={projectId ?? (values.project || undefined)}
      />
      <TaskFormDialog
        open={editing !== null}
        task={editing ?? undefined}
        onClose={() => setEditing(null)}
        projects={projects}
        members={members}
      />
      <DeleteTaskDialog task={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}
