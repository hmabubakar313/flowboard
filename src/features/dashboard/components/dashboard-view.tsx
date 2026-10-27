"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { QueryState } from "@/components/feedback/query-state";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClasses } from "@/components/ui/button";
import { Deadline } from "@/components/ui/deadline";
import { FolderIcon, PlusIcon } from "@/components/ui/icons";
import { PageHeader, Panel } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { statusDotClass } from "@/components/ui/status-badge";
import { useActivity } from "@/features/activity/hooks";
import type { Activity } from "@/features/activity/schemas";
import { ProgressBar, ProjectStatusBadge } from "@/features/projects/components/project-badges";
import { ProjectFormDialog } from "@/features/projects/components/project-form-dialog";
import { useProjects } from "@/features/projects/hooks";
import { TASK_STATUS_TONE } from "@/features/tasks/components/task-badges";
import { useTasks } from "@/features/tasks/hooks";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/features/tasks/schemas";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { useCurrentUser, useMembers } from "@/features/workspace/hooks";
import type { Member } from "@/features/workspace/schemas";
import { cn } from "@/lib/utils/cn";
import { formatTimeAgo } from "@/lib/utils/dates";
import Link from "next/link";
import { useMemo, useState } from "react";
import { summarizeTasks } from "../summary";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

export function DashboardView() {
  const { workspace } = useWorkspace();
  const { data: user } = useCurrentUser();
  const { data: members = [] } = useMembers();
  const [creatingProject, setCreatingProject] = useState(false);
  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const projects = useProjects({ workspaceId: workspace.id });
  const tasks = useTasks({ workspaceId: workspace.id });
  const activity = useActivity(workspace.id, 8);

  const projectNames = useMemo(
    () => new Map((projects.data ?? []).map((p) => [p.id, p.name])),
    [projects.data],
  );
  const summary = useMemo(() => (tasks.data ? summarizeTasks(tasks.data) : null), [tasks.data]);

  const newProject = (
    <Button variant="primary" onClick={() => setCreatingProject(true)}>
      <PlusIcon /> New project
    </Button>
  );

  return (
    <>
      <PageHeader
        title={user ? `${greeting()}, ${user.name.split(" ")[0]}` : "Dashboard"}
        description={
          user
            ? new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : undefined
        }
        actions={projects.data && projects.data.length > 0 ? newProject : undefined}
      />

      <div className="flex flex-col gap-6">
        <Panel title="Tasks by status">
          <QueryState
            query={tasks}
            errorTitle="Couldn't load tasks"
            skeleton={<PanelSkeleton rows={2} />}
          >
            {() =>
              summary && summary.total > 0 ? (
                <div className="p-4">
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {TASK_STATUSES.map((status) => (
                      <li key={status}>
                        <Link
                          href={`/tasks?status=${status}`}
                          className="rounded-control hover:bg-hover -m-1 block p-1"
                        >
                          <span className="tabular block text-2xl font-semibold">
                            {summary.byStatus[status]}
                          </span>
                          <span className="text-ink-2 flex items-center gap-1.5 text-sm">
                            <span
                              aria-hidden="true"
                              className={cn(
                                "size-1.5 rounded-full",
                                statusDotClass(TASK_STATUS_TONE[status]),
                              )}
                            />
                            {TASK_STATUS_LABELS[status]}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div
                    aria-hidden="true"
                    className="bg-sunken mt-4 flex h-2 overflow-hidden rounded-full"
                  >
                    {TASK_STATUSES.map((status) => (
                      <div
                        key={status}
                        className={statusDotClass(TASK_STATUS_TONE[status])}
                        style={{ width: `${(summary.byStatus[status] / summary.total) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-ink-3 mt-2 text-sm">
                    {summary.total} {summary.total === 1 ? "task" : "tasks"} in {workspace.name}
                  </p>
                </div>
              ) : (
                <EmptyState
                  title="No tasks yet"
                  description="Task counts will appear here once your team starts adding work."
                  action={
                    <Link href="/tasks" className={buttonClasses("primary")}>
                      Go to tasks
                    </Link>
                  }
                />
              )
            }
          </QueryState>
        </Panel>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-6">
            <Panel
              title="Upcoming deadlines"
              action={
                summary && summary.overdue > 0 ? (
                  <span className="text-danger text-sm font-medium">{summary.overdue} overdue</span>
                ) : undefined
              }
            >
              <QueryState
                query={tasks}
                errorTitle="Couldn't load deadlines"
                skeleton={<PanelSkeleton />}
              >
                {() =>
                  summary && summary.upcoming.length > 0 ? (
                    <ul className="divide-line divide-y">
                      {summary.upcoming.slice(0, 6).map((task) => (
                        <li key={task.id}>
                          <Link
                            href={`/projects/${task.projectId}`}
                            className="hover:bg-hover flex items-center gap-3 px-4 py-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{task.title}</p>
                              <p className="text-ink-3 truncate text-sm">
                                {projectNames.get(task.projectId) ?? "Project"}
                              </p>
                            </div>
                            <span className="shrink-0">
                              <Deadline day={task.dueDate} />
                            </span>
                            <span className="hidden size-7 shrink-0 sm:block">
                              {task.assigneeId && membersById.get(task.assigneeId) ? (
                                <Avatar name={membersById.get(task.assigneeId)?.name ?? ""} />
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      title="Nothing due soon"
                      description="Open tasks due in the next two weeks, or already overdue, show up here."
                    />
                  )
                }
              </QueryState>
            </Panel>

            <Panel
              title="Recent projects"
              action={
                <Link href="/projects" className="text-accent text-sm font-medium hover:underline">
                  View all
                </Link>
              }
            >
              <QueryState
                query={projects}
                errorTitle="Couldn't load projects"
                skeleton={<PanelSkeleton />}
                isEmpty={(list) => list.length === 0}
                empty={
                  <EmptyState
                    icon={<FolderIcon />}
                    title="No projects yet"
                    description="Create your first project to start planning work with your team."
                    action={newProject}
                  />
                }
              >
                {(list) => (
                  <ul className="divide-line divide-y">
                    {list.slice(0, 4).map((project) => (
                      <li key={project.id}>
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:bg-hover flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3"
                        >
                          <span className="min-w-0 flex-1 basis-48 truncate font-medium">
                            {project.name}
                          </span>
                          <ProjectStatusBadge status={project.status} />
                          <ProgressBar done={project.doneCount} total={project.taskCount} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </QueryState>
            </Panel>
          </div>

          <Panel title="Recent activity">
            <QueryState
              query={activity}
              errorTitle="Couldn't load activity"
              skeleton={<PanelSkeleton rows={5} />}
              isEmpty={(items) => items.length === 0}
              empty={
                <EmptyState
                  title="No activity yet"
                  description="Changes made by your team will be listed here."
                />
              }
            >
              {(items) => (
                <ul className="divide-line divide-y">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 px-4 py-3">
                      <Avatar name={membersById.get(item.actorId)?.name ?? "?"} />
                      <div className="min-w-0 flex-1">
                        <ActivityText item={item} actor={membersById.get(item.actorId)} />
                        <p className="text-ink-3 text-sm">{formatTimeAgo(item.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </QueryState>
          </Panel>
        </div>
      </div>

      <ProjectFormDialog open={creatingProject} onClose={() => setCreatingProject(false)} />
    </>
  );
}

function ActivityText({ item, actor }: { item: Activity; actor: Member | undefined }) {
  return (
    <p className="text-ink-2">
      <span className="text-ink font-medium">{actor?.name ?? "Someone"}</span> {item.verb}{" "}
      {item.entityType} <span className="text-ink font-medium">{item.entityName}</span>
      {item.detail ? <> {item.detail}</> : null}
    </p>
  );
}
