import { z } from "zod";
import { api } from "@/lib/api";
import { projectSchema, type ProjectInput, type ProjectStatus } from "../schemas";

export interface ProjectFilters {
  workspaceId: string;
  search?: string;
  status?: ProjectStatus;
}

export const projectsService = {
  list: (filters: ProjectFilters, signal?: AbortSignal) =>
    api.request("/projects", z.array(projectSchema), { query: { ...filters }, signal }),

  get: (id: string, signal?: AbortSignal) =>
    api.request(`/projects/${encodeURIComponent(id)}`, projectSchema, { signal }),

  create: (workspaceId: string, input: ProjectInput) =>
    api.request("/projects", projectSchema, {
      method: "POST",
      query: { workspaceId },
      body: input,
    }),

  update: (id: string, input: Partial<ProjectInput>) =>
    api.request(`/projects/${encodeURIComponent(id)}`, projectSchema, {
      method: "PATCH",
      body: input,
    }),

  remove: (id: string) =>
    api.request(`/projects/${encodeURIComponent(id)}`, z.null(), { method: "DELETE" }),
};
