"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { QueryState } from "@/components/feedback/query-state";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClasses } from "@/components/ui/button";
import { Deadline } from "@/components/ui/deadline";
import { FolderIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { TasksView } from "@/features/tasks/components/tasks-view";
import { useMembers } from "@/features/workspace/hooks";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProject } from "../hooks";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { ProgressBar, ProjectStatusBadge } from "./project-badges";
import { ProjectFormDialog } from "./project-form-dialog";

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const query = useProject(id);
  const { data: members = [] } = useMembers();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (query.error instanceof ApiError && query.error.code === "not_found") {
    return (
      <EmptyState
        icon={<FolderIcon />}
        title="Project not found"
        description="It may have been deleted, or it belongs to another workspace."
        action={
          <Link href="/projects" className={buttonClasses("primary")}>
            Back to projects
          </Link>
        }
      />
    );
  }

  return (
    <QueryState
      query={query}
      errorTitle="Couldn't load this project"
      skeleton={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <Skeleton className="mt-6 h-48 w-full" />
        </div>
      }
    >
      {(project) => {
        const owner = members.find((m) => m.id === project.ownerId);
        return (
          <>
            <PageHeader
              title={project.name}
              description={project.description || undefined}
              actions={
                <>
                  <Button onClick={() => setEditing(true)}>Edit</Button>
                  <Button onClick={() => setDeleting(true)}>Delete</Button>
                </>
              }
            />

            <dl className="border-line bg-surface rounded-panel mb-8 grid gap-x-8 gap-y-4 border p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-ink-3 mb-1 text-xs font-medium tracking-wide uppercase">
                  Status
                </dt>
                <dd>
                  <ProjectStatusBadge status={project.status} />
                </dd>
              </div>
              <div>
                <dt className="text-ink-3 mb-1 text-xs font-medium tracking-wide uppercase">
                  Deadline
                </dt>
                <dd>
                  <Deadline day={project.deadline} muted={project.status === "completed"} />
                </dd>
              </div>
              <div>
                <dt className="text-ink-3 mb-1 text-xs font-medium tracking-wide uppercase">
                  Owner
                </dt>
                <dd className="flex items-center gap-2">
                  {owner ? (
                    <>
                      <Avatar name={owner.name} size="sm" /> {owner.name}
                    </>
                  ) : (
                    "Unknown"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-ink-3 mb-1 text-xs font-medium tracking-wide uppercase">
                  Progress
                </dt>
                <dd>
                  <ProgressBar done={project.doneCount} total={project.taskCount} />
                </dd>
              </div>
            </dl>

            <h2 className="mb-3 text-lg font-semibold">Tasks</h2>
            <TasksView projectId={project.id} />

            <ProjectFormDialog open={editing} project={project} onClose={() => setEditing(false)} />
            <DeleteProjectDialog
              project={deleting ? project : null}
              onClose={() => setDeleting(false)}
              onDeleted={() => router.push("/projects")}
            />
          </>
        );
      }}
    </QueryState>
  );
}
