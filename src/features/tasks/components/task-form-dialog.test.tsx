import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { tasksService } from "../services";
import { TaskFormDialog } from "./task-form-dialog";

vi.mock("@/features/workspace/components/workspace-provider", () => ({
  useWorkspace: () => ({
    workspace: { id: "w_1", name: "Test", plan: "Team" },
    workspaces: [],
    setWorkspaceId: vi.fn(),
  }),
}));
vi.mock("../services", () => ({
  tasksService: { create: vi.fn(), update: vi.fn(), list: vi.fn(), remove: vi.fn() },
}));

const project = {
  id: "p_1",
  workspaceId: "w_1",
  name: "Portal",
  description: "",
  status: "active" as const,
  deadline: null,
  ownerId: "u_1",
  taskCount: 0,
  doneCount: 0,
  createdAt: "",
  updatedAt: "",
};
const member = { id: "u_1", name: "Amara Okafor", email: "a@example.com", role: "Lead" };

function setup() {
  const onClose = vi.fn();
  renderWithProviders(
    <TaskFormDialog open onClose={onClose} projects={[project]} members={[member]} />,
  );
  return { onClose, user: userEvent.setup() };
}

describe("TaskFormDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a validation message and does not submit an empty title", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("Enter a task title")).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toHaveAttribute("aria-invalid", "true");
    expect(tasksService.create).not.toHaveBeenCalled();
  });

  it("submits once even when the button is clicked repeatedly", async () => {
    vi.mocked(tasksService.create).mockImplementation(() => new Promise(() => {}));
    const { user } = setup();

    await user.type(screen.getByLabelText(/Title/), "Write release notes");
    const submit = screen.getByRole("button", { name: "Create task" });
    await user.click(submit);
    await user.click(screen.getByRole("button", { name: "Saving…" }));

    expect(tasksService.create).toHaveBeenCalledTimes(1);
    expect(tasksService.create).toHaveBeenCalledWith(
      "w_1",
      expect.objectContaining({ title: "Write release notes", projectId: "p_1", dueDate: null }),
    );
  });

  it("shows server field errors next to the field", async () => {
    vi.mocked(tasksService.create).mockRejectedValue(
      new ApiError("validation", "Invalid", {
        status: 422,
        fieldErrors: { title: "A task with this title already exists" },
      }),
    );
    const { user, onClose } = setup();

    await user.type(screen.getByLabelText(/Title/), "Duplicate");
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("A task with this title already exists")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("button", { name: "Create task" })).toBeEnabled());
  });
});
