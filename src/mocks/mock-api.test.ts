import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { projectSchema } from "@/features/projects/schemas";
import { taskSchema } from "@/features/tasks/schemas";
import { createTestDb } from "./db";
import { createMockClient } from "./mock-client";

const client = createMockClient({ latency: [0, 0] });
const taskList = z.array(taskSchema);

beforeEach(() => {
  createTestDb();
});

describe("mock API", () => {
  it("validates input on the server side too", async () => {
    const request = client.request("/tasks", taskSchema, {
      method: "POST",
      query: { workspaceId: "w_northwind" },
      body: {
        projectId: "p_portal",
        title: "",
        description: "",
        status: "todo",
        priority: "low",
        dueDate: null,
        assigneeId: null,
      },
    });
    await expect(request).rejects.toMatchObject({
      code: "validation",
      fieldErrors: { title: "Enter a task title" },
    });
  });

  it("deletes a project together with its tasks", async () => {
    const before = await client.request("/tasks", taskList, {
      query: { workspaceId: "w_northwind", projectId: "p_portal" },
    });
    expect(before.length).toBeGreaterThan(0);

    await client.request("/projects/p_portal", z.null(), { method: "DELETE" });

    const after = await client.request("/tasks", taskList, {
      query: { workspaceId: "w_northwind", projectId: "p_portal" },
    });
    expect(after).toEqual([]);
    await expect(client.request("/projects/p_portal", projectSchema)).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("filters tasks by status and search text", async () => {
    const done = await client.request("/tasks", taskList, {
      query: { workspaceId: "w_northwind", status: "done" },
    });
    expect(done.every((t) => t.status === "done")).toBe(true);

    const found = await client.request("/tasks", taskList, {
      query: { workspaceId: "w_northwind", search: "PRORATION" },
    });
    expect(found.map((t) => t.title)).toEqual(["Reconcile proration differences"]);
  });
});
