import { describe, expect, it } from "vitest";
import { projectFormSchema, toProjectInput } from "@/features/projects/schemas";
import { taskFormSchema, toTaskInput, type TaskFormValues } from "./index";

const validTask: TaskFormValues = {
  projectId: "p_1",
  title: "Write release notes",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  assigneeId: "",
};

describe("task form schema", () => {
  it("requires a title and trims whitespace", () => {
    const result = taskFormSchema.safeParse({ ...validTask, title: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter a task title");
  });

  it("rejects malformed due dates but allows an empty one", () => {
    expect(taskFormSchema.safeParse({ ...validTask, dueDate: "31/12/2026" }).success).toBe(false);
    expect(taskFormSchema.safeParse({ ...validTask, dueDate: "" }).success).toBe(true);
  });

  it("converts empty form strings to null for the API", () => {
    expect(toTaskInput(validTask)).toMatchObject({ dueDate: null, assigneeId: null });
  });
});

describe("project form schema", () => {
  it("requires an owner and maps an empty deadline to null", () => {
    const base = {
      name: "Portal",
      description: "",
      status: "active",
      deadline: "",
      ownerId: "",
    } as const;
    expect(projectFormSchema.safeParse(base).success).toBe(false);
    const ok = projectFormSchema.parse({ ...base, ownerId: "u_1" });
    expect(toProjectInput(ok).deadline).toBeNull();
  });
});
