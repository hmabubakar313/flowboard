"use client";

import { Avatar } from "@/components/ui/avatar";
import { Deadline } from "@/components/ui/deadline";
import { DropdownMenu, MenuItem } from "@/components/ui/dropdown-menu";
import { MoreIcon } from "@/components/ui/icons";
import type { Member } from "@/features/workspace/schemas";
import Link from "next/link";
import type { Project } from "../schemas";
import { ProgressBar, ProjectStatusBadge } from "./project-badges";

interface ProjectListProps {
  projects: Project[];
  members: Map<string, Member>;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectActions({
  project,
  onEdit,
  onDelete,
}: Pick<ProjectListProps, "onEdit" | "onDelete"> & { project: Project }) {
  return (
    <DropdownMenu
      label={`Actions for ${project.name}`}
      triggerClassName="inline-flex size-8 items-center justify-center rounded-control text-ink-3 hover:bg-sunken hover:text-ink"
      trigger={<MoreIcon />}
    >
      <MenuItem onClick={() => onEdit(project)}>Edit project</MenuItem>
      <MenuItem tone="danger" onClick={() => onDelete(project)}>
        Delete project
      </MenuItem>
    </DropdownMenu>
  );
}

function Owner({ member }: { member: Member | undefined }) {
  if (!member) return <span className="text-ink-3">Unknown</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar name={member.name} size="sm" />
      <span className="truncate">{member.name}</span>
    </span>
  );
}

export function ProjectList({ projects, members, onEdit, onDelete }: ProjectListProps) {
  return (
    <>
      {/* Tablet and up: a real table for scanning columns. */}
      <table className="hidden w-full text-left @min-[56rem]:table">
        <caption className="sr-only">Projects</caption>
        <thead>
          <tr className="border-line text-ink-3 border-b text-xs font-medium tracking-wide uppercase">
            <th scope="col" className="py-2.5 pl-4 font-medium">
              Project
            </th>
            <th scope="col" className="px-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-3 font-medium">
              Progress
            </th>
            <th scope="col" className="px-3 font-medium">
              Deadline
            </th>
            <th scope="col" className="px-3 font-medium">
              Owner
            </th>
            <th scope="col" className="w-12 pr-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-line hover:bg-hover border-b last:border-b-0">
              <td className="max-w-80 py-3 pl-4">
                <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                  {project.name}
                </Link>
                <p className="text-ink-3 truncate text-sm">
                  {project.description || "No description"}
                </p>
              </td>
              <td className="px-3">
                <ProjectStatusBadge status={project.status} />
              </td>
              <td className="px-3">
                <ProgressBar done={project.doneCount} total={project.taskCount} />
              </td>
              <td className="px-3">
                <Deadline day={project.deadline} muted={project.status === "completed"} />
              </td>
              <td className="max-w-40 px-3">
                <Owner member={members.get(project.ownerId)} />
              </td>
              <td className="pr-3 text-right">
                <ProjectActions project={project} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: stacked rows with the same information, no horizontal scrolling. */}
      <ul className="divide-line divide-y @min-[56rem]:hidden">
        {projects.map((project) => (
          <li key={project.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                {project.name}
              </Link>
              <div className="-mt-1 -mr-2">
                <ProjectActions project={project} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <ProjectStatusBadge status={project.status} />
              <Deadline day={project.deadline} muted={project.status === "completed"} />
            </div>
            <ProgressBar done={project.doneCount} total={project.taskCount} />
          </li>
        ))}
      </ul>
    </>
  );
}
