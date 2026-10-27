import { z } from "zod";
import { api } from "@/lib/api";
import { taskSchema, type TaskInput, type TaskPriority, type TaskStatus } from "../schemas";

export interface TaskFilters {
  workspaceId: string;
  projectId?: string;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  /** A member id, or "unassigned". */
  assigneeId?: string;
}

export const tasksService = {
  list: (filters: TaskFilters, signal?: AbortSignal) =>
    api.request("/tasks", z.array(taskSchema), { query: { ...filters }, signal }),

  create: (workspaceId: string, input: TaskInput) =>
    api.request("/tasks", taskSchema, { method: "POST", query: { workspaceId }, body: input }),

  update: (id: string, input: Partial<TaskInput>) =>
    api.request(`/tasks/${encodeURIComponent(id)}`, taskSchema, { method: "PATCH", body: input }),

  remove: (id: string) =>
    api.request(`/tasks/${encodeURIComponent(id)}`, z.null(), { method: "DELETE" }),
};
