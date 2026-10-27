"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import { useDeleteProject } from "../hooks";
import type { Project } from "../schemas";

interface DeleteProjectDialogProps {
  project: Project | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteProjectDialog({ project, onClose, onDeleted }: DeleteProjectDialogProps) {
  const deletion = useDeleteProject();
  const toast = useToast();

  const close = () => {
    deletion.reset();
    onClose();
  };

  const confirm = async () => {
    if (!project) return;
    try {
      await deletion.mutateAsync(project.id);
      toast.success(`Deleted “${project.name}”`);
      close();
      onDeleted?.();
    } catch {
      // The error is shown inside the dialog so the user can retry or cancel.
    }
  };

  const taskNote =
    project && project.taskCount > 0
      ? ` Its ${project.taskCount} ${project.taskCount === 1 ? "task" : "tasks"} will be deleted too.`
      : "";

  return (
    <ConfirmDialog
      open={project !== null}
      title="Delete this project?"
      description={
        project
          ? `“${project.name}” will be permanently deleted.${taskNote} This can't be undone.`
          : ""
      }
      confirmLabel="Delete project"
      pending={deletion.isPending}
      error={deletion.error ? getErrorMessage(deletion.error) : null}
      onConfirm={() => void confirm()}
      onCancel={close}
    />
  );
}
