import { describe, expect, it } from "vitest";
import type { Task } from "@/features/tasks/schemas";
import { summarizeTasks } from "./summary";

function task(overrides: Partial<Task>): Task {
  return {
    id: "t",
    workspaceId: "w",
    projectId: "p",
    number: 1,
    title: "Task",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: null,
    assigneeId: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("summarizeTasks", () => {
  const now = "2026-10-26";

  it("counts tasks per status and derives the total", () => {
    const summary = summarizeTasks(
      [task({ status: "todo" }), task({ status: "todo" }), task({ status: "done" })],
      now,
    );
    expect(summary.total).toBe(3);
    expect(summary.byStatus).toEqual({ todo: 2, in_progress: 0, in_review: 0, done: 1 });
  });

  it("lists open tasks due within the window, overdue first, and ignores done work", () => {
    const summary = summarizeTasks(
      [
        task({ id: "later", dueDate: "2026-11-20" }),
        task({ id: "soon", dueDate: "2026-10-30" }),
        task({ id: "late", dueDate: "2026-10-20" }),
        task({ id: "finished", dueDate: "2026-10-27", status: "done" }),
        task({ id: "undated" }),
      ],
      now,
    );
    expect(summary.upcoming.map((t) => t.id)).toEqual(["late", "soon"]);
    expect(summary.overdue).toBe(1);
  });
});
