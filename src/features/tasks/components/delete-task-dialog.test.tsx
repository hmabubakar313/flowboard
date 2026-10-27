import { renderWithProviders } from "@/test/render";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { tasksService } from "../services";
import type { Task } from "../schemas";
import { DeleteTaskDialog } from "./delete-task-dialog";

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

describe("DeleteTaskDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does nothing when the user cancels", async () => {
    const onClose = vi.fn();
    renderWithProviders(<DeleteTaskDialog task={task} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(tasksService.remove).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("deletes the task after confirmation", async () => {
    vi.mocked(tasksService.remove).mockResolvedValue(null);
    const onClose = vi.fn();
    renderWithProviders(<DeleteTaskDialog task={task} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete task" }));

    expect(tasksService.remove).toHaveBeenCalledWith("t_1");
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("keeps the dialog open and explains a failed delete", async () => {
    vi.mocked(tasksService.remove).mockRejectedValue(
      new ApiError("network", "Can't reach the server. Check your connection and try again."),
    );
    const onClose = vi.fn();
    renderWithProviders(<DeleteTaskDialog task={task} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Can't reach the server");
    expect(onClose).not.toHaveBeenCalled();
  });
});
