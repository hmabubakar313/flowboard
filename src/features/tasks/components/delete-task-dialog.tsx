"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import { useDeleteTask } from "../hooks";
import type { Task } from "../schemas";

export function DeleteTaskDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const deletion = useDeleteTask();
  const toast = useToast();

  const close = () => {
    deletion.reset();
    onClose();
  };

  const confirm = async () => {
    if (!task) return;
    try {
      await deletion.mutateAsync(task.id);
      toast.success("Task deleted");
      close();
    } catch {
      // Shown inside the dialog so the user can retry or cancel.
    }
  };

  return (
    <ConfirmDialog
      open={task !== null}
      title="Delete this task?"
      description={task ? `“${task.title}” will be permanently deleted. This can't be undone.` : ""}
      confirmLabel="Delete task"
      pending={deletion.isPending}
      error={deletion.error ? getErrorMessage(deletion.error) : null}
      onConfirm={() => void confirm()}
      onCancel={close}
    />
  );
}
