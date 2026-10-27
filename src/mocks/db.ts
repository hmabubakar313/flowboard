import type { Activity } from "@/features/activity/schemas";
import type { Project } from "@/features/projects/schemas";
import type { Task } from "@/features/tasks/schemas";
import type { Member, Workspace } from "@/features/workspace/schemas";
import { createSeed } from "./seed";

export type ProjectRecord = Omit<Project, "taskCount" | "doneCount">;

export interface Db {
  version: 1;
  currentUserId: string;
  members: Member[];
  workspaces: Workspace[];
  projects: ProjectRecord[];
  tasks: Task[];
  activity: Activity[];
  nextTaskNumber: number;
}

const STORAGE_KEY = "flowboard:mock-db:v1";

let cache: Db | null = null;

function isDb(value: unknown): value is Db {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 1 &&
    "tasks" in value &&
    Array.isArray(value.tasks)
  );
}

function readStorage(): Db | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDb(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** The mock backend's "database": memory first, mirrored to localStorage so edits survive reloads. */
export function getDb(): Db {
  cache ??= (typeof window === "undefined" ? null : readStorage()) ?? createSeed();
  return cache;
}

export function saveDb(): void {
  if (!cache || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage may be full or blocked; the in-memory copy still works for this session.
  }
}

export function resetDb(): void {
  cache = createSeed();
  saveDb();
}

/** Test helper: drop the cached copy and start from a fresh seed without touching storage. */
export function createTestDb(): Db {
  cache = createSeed();
  return cache;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
