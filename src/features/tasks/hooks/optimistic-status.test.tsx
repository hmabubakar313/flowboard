import { createTestQueryClient } from "@/test/render";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import type { Task } from "../schemas";
import { tasksService } from "../services";
import { taskKeys, useUpdateTaskStatus } from "./index";

vi.mock("../services", () => ({
  tasksService: { create: vi.fn(), update: vi.fn(), list: vi.fn(), remove: vi.fn() },
}));

const task: Task = {
  id: "t_1",
  workspaceId: "w_1",
  projectId: "p_1",
  number: 101,
  title: "Build invoice list page",
  description: "",
  status: "todo",
  priority: "high",
  dueDate: null,
  assigneeId: null,
  createdAt: "",
  updatedAt: "",
};
const filters = { workspaceId: "w_1" };

function setup() {
  const client = createTestQueryClient();
  client.setQueryData(taskKeys.list(filters), [task]);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useUpdateTaskStatus(), { wrapper }) };
}

describe("useUpdateTaskStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tasksService.list).mockResolvedValue([task]);
  });

  it("moves the task immediately, before the server responds", async () => {
    vi.mocked(tasksService.update).mockImplementation(() => new Promise(() => {}));
    const { client, result } = setup();

    act(() => result.current.mutate({ id: "t_1", status: "done" }));

    await waitFor(() =>
      expect(client.getQueryData<Task[]>(taskKeys.list(filters))?.[0]?.status).toBe("done"),
    );
  });

  it("rolls the task back when the request fails", async () => {
    vi.mocked(tasksService.update).mockRejectedValue(new ApiError("network", "offline"));
    const { client, result } = setup();

    act(() => result.current.mutate({ id: "t_1", status: "done" }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<Task[]>(taskKeys.list(filters))?.[0]?.status).toBe("todo");
  });
});
