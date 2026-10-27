import type { z } from "zod";
import { ApiError, defaultMessage, type FieldErrors } from "@/lib/api/errors";
import type { Activity } from "@/features/activity/schemas";
import {
  PROJECT_STATUS_LABELS,
  projectInputSchema,
  type Project,
} from "@/features/projects/schemas";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  taskInputSchema,
  type Task,
} from "@/features/tasks/schemas";
import { newId, type Db, type ProjectRecord } from "./db";

export interface HandlerContext {
  db: Db;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
  body: unknown;
}

export type Handler = (ctx: HandlerContext) => unknown;

function notFound(entity: string): ApiError {
  return new ApiError("not_found", `${entity} not found`, { status: 404 });
}

/** Mirrors what a real backend does: never trust the client, validate again. */
function parseBody<S extends z.ZodType>(schema: S, body: unknown): z.infer<S> {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  throw new ApiError("validation", defaultMessage("validation"), { status: 422, fieldErrors });
}

function requireQuery(ctx: HandlerContext, key: string): string {
  const value = ctx.query[key];
  if (!value) {
    throw new ApiError("validation", `${key} is required`, {
      status: 422,
      fieldErrors: { [key]: `${key} is required` },
    });
  }
  return value;
}

function matchesSearch(text: string[], search: string | undefined): boolean {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  return text.some((value) => value.toLowerCase().includes(needle));
}

function withCounts(db: Db, record: ProjectRecord): Project {
  const tasks = db.tasks.filter((t) => t.projectId === record.id);
  return {
    ...record,
    taskCount: tasks.length,
    doneCount: tasks.filter((t) => t.status === "done").length,
  };
}

function record(
  db: Db,
  workspaceId: string,
  verb: Activity["verb"],
  entityType: Activity["entityType"],
  entityName: string,
  detail: string | null = null,
): void {
  db.activity.unshift({
    id: newId("a"),
    workspaceId,
    actorId: db.currentUserId,
    verb,
    entityType,
    entityName,
    detail,
    createdAt: new Date().toISOString(),
  });
  db.activity.length = Math.min(db.activity.length, 100);
}

function findProject(db: Db, id: string): ProjectRecord {
  const found = db.projects.find((p) => p.id === id);
  if (!found) throw notFound("Project");
  return found;
}

function findTask(db: Db, id: string): Task {
  const found = db.tasks.find((t) => t.id === id);
  if (!found) throw notFound("Task");
  return found;
}

export const handlers: Record<string, Handler> = {
  "GET /me": ({ db }) => {
    const me = db.members.find((m) => m.id === db.currentUserId);
    if (!me) throw notFound("User");
    return me;
  },

  "GET /members": ({ db }) => db.members,

  "GET /workspaces": ({ db }) => db.workspaces,

  "GET /projects": (ctx) => {
    const workspaceId = requireQuery(ctx, "workspaceId");
    const { search, status } = ctx.query;
    return ctx.db.projects
      .filter((p) => p.workspaceId === workspaceId)
      .filter((p) => !status || p.status === status)
      .filter((p) => matchesSearch([p.name, p.description], search))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((p) => withCounts(ctx.db, p));
  },

  "GET /projects/:id": ({ db, params }) => withCounts(db, findProject(db, params.id ?? "")),

  "POST /projects": (ctx) => {
    const workspaceId = requireQuery(ctx, "workspaceId");
    const input = parseBody(projectInputSchema, ctx.body);
    const now = new Date().toISOString();
    const created: ProjectRecord = {
      id: newId("p"),
      workspaceId,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    ctx.db.projects.push(created);
    record(ctx.db, workspaceId, "created", "project", created.name);
    return withCounts(ctx.db, created);
  },

  "PATCH /projects/:id": ({ db, params, body }) => {
    const existing = findProject(db, params.id ?? "");
    const input = parseBody(projectInputSchema.partial(), body);
    Object.assign(existing, input, { updatedAt: new Date().toISOString() });
    const detail =
      input.status && Object.keys(input).length === 1
        ? `status set to ${PROJECT_STATUS_LABELS[input.status]}`
        : null;
    record(db, existing.workspaceId, "updated", "project", existing.name, detail);
    return withCounts(db, existing);
  },

  "DELETE /projects/:id": ({ db, params }) => {
    const existing = findProject(db, params.id ?? "");
    db.projects = db.projects.filter((p) => p.id !== existing.id);
    db.tasks = db.tasks.filter((t) => t.projectId !== existing.id);
    record(db, existing.workspaceId, "deleted", "project", existing.name);
    return null;
  },

  "GET /tasks": (ctx) => {
    const workspaceId = requireQuery(ctx, "workspaceId");
    const { projectId, status, priority, assigneeId, search } = ctx.query;
    const list = ctx.db.tasks
      .filter((t) => t.workspaceId === workspaceId)
      .filter((t) => !projectId || t.projectId === projectId)
      .filter((t) => !status || t.status === status)
      .filter((t) => !priority || t.priority === priority)
      .filter(
        (t) =>
          !assigneeId ||
          (assigneeId === "unassigned" ? !t.assigneeId : t.assigneeId === assigneeId),
      )
      .filter((t) => matchesSearch([t.title, t.description], search));

    // Default: open tasks first, soonest due date first, undated tasks last.
    return list.sort((a, b) => {
      if ((a.status === "done") !== (b.status === "done")) return a.status === "done" ? 1 : -1;
      if (a.dueDate === b.dueDate) return b.updatedAt.localeCompare(a.updatedAt);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  },

  "POST /tasks": (ctx) => {
    const workspaceId = requireQuery(ctx, "workspaceId");
    const input = parseBody(taskInputSchema, ctx.body);
    const project = ctx.db.projects.find(
      (p) => p.id === input.projectId && p.workspaceId === workspaceId,
    );
    if (!project) {
      throw new ApiError("validation", defaultMessage("validation"), {
        status: 422,
        fieldErrors: { projectId: "Choose a project in this workspace" },
      });
    }
    const now = new Date().toISOString();
    const created: Task = {
      id: newId("t"),
      workspaceId,
      number: ctx.db.nextTaskNumber++,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    ctx.db.tasks.push(created);
    project.updatedAt = now;
    record(ctx.db, workspaceId, "created", "task", created.title);
    return created;
  },

  "PATCH /tasks/:id": ({ db, params, body }) => {
    const existing = findTask(db, params.id ?? "");
    const input = parseBody(taskInputSchema.partial(), body);
    const previousStatus = existing.status;
    Object.assign(existing, input, { updatedAt: new Date().toISOString() });

    if (input.status && input.status !== previousStatus) {
      const verb = input.status === "done" ? "completed" : "moved";
      const detail = input.status === "done" ? null : `to ${TASK_STATUS_LABELS[input.status]}`;
      record(db, existing.workspaceId, verb, "task", existing.title, detail);
    } else {
      const detail = input.priority
        ? `priority set to ${TASK_PRIORITY_LABELS[input.priority]}`
        : null;
      record(db, existing.workspaceId, "updated", "task", existing.title, detail);
    }
    return existing;
  },

  "DELETE /tasks/:id": ({ db, params }) => {
    const existing = findTask(db, params.id ?? "");
    db.tasks = db.tasks.filter((t) => t.id !== existing.id);
    record(db, existing.workspaceId, "deleted", "task", existing.title);
    return null;
  },

  "GET /activity": (ctx) => {
    const workspaceId = requireQuery(ctx, "workspaceId");
    const limit = Number(ctx.query.limit ?? 10);
    return ctx.db.activity.filter((a) => a.workspaceId === workspaceId).slice(0, limit);
  },
};
