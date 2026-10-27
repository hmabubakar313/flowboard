"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { QueryState } from "@/components/feedback/query-state";
import { SearchInput } from "@/components/forms/search-input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";
import { FolderIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { PageHeader, Panel } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { useMembers } from "@/features/workspace/hooks";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useMemo, useState } from "react";
import { useProjects } from "../hooks";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  projectStatusSchema,
  type Project,
} from "../schemas";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectList } from "./project-list";

export function ProjectsView() {
  const { workspace } = useWorkspace();
  const { values, setFilters, hasActiveFilters } = useUrlFilters(["q", "status"] as const);
  const [searchKey, setSearchKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const status = projectStatusSchema.safeParse(values.status).data;
  const query = useProjects({ workspaceId: workspace.id, search: values.q || undefined, status });
  const { data: members = [] } = useMembers();
  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const clearFilters = () => {
    setFilters({ q: "", status: "" });
    setSearchKey((key) => key + 1);
  };

  const newProject = (
    <Button variant="primary" onClick={() => setCreating(true)}>
      <PlusIcon /> New project
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description="Everything your team is building, with progress drawn from its tasks."
        actions={newProject}
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <SearchInput
          key={searchKey}
          label="Search projects"
          placeholder="Search projects"
          initialValue={values.q}
          onSearch={(q) => setFilters({ q })}
        />
        <div className="sm:w-44">
          <Select
            aria-label="Filter by status"
            value={status ?? ""}
            onChange={(event) => setFilters({ status: event.target.value })}
          >
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Panel className="@container">
        <QueryState
          query={query}
          errorTitle="Couldn't load projects"
          skeleton={<ListSkeleton />}
          isEmpty={(projects) => projects.length === 0}
          empty={
            hasActiveFilters ? (
              <EmptyState
                icon={<SearchIcon />}
                title="No projects match your filters"
                description="Try a different search term or status."
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            ) : (
              <EmptyState
                icon={<FolderIcon />}
                title="No projects yet"
                description="Create a project to start organising tasks, deadlines and owners."
                action={newProject}
              />
            )
          }
        >
          {(projects) => (
            <ProjectList
              projects={projects}
              members={membersById}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          )}
        </QueryState>
      </Panel>

      <ProjectFormDialog open={creating} onClose={() => setCreating(false)} />
      <ProjectFormDialog
        open={editing !== null}
        project={editing ?? undefined}
        onClose={() => setEditing(null)}
      />
      <DeleteProjectDialog project={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
