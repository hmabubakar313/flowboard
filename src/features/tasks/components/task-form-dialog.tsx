"use client";

import { applyApiError } from "@/components/forms/apply-api-error";
import { Field } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toast";
import type { Project } from "@/features/projects/schemas";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import type { Member } from "@/features/workspace/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateTask, useUpdateTask } from "../hooks";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  taskFormSchema,
  toTaskFormValues,
  toTaskInput,
  type Task,
  type TaskFormValues,
} from "../schemas";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  members: Member[];
  /** When provided, the dialog edits this task instead of creating one. */
  task?: Task;
  /** Pre-selects a project for new tasks (e.g. from a project page). */
  defaultProjectId?: string;
}

export function TaskFormDialog({ open, onClose, task, ...formProps }: TaskFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={task ? "Edit task" : "New task"}>
      <TaskForm task={task} onDone={onClose} {...formProps} />
    </Dialog>
  );
}

const FIELDS = [
  "projectId",
  "title",
  "description",
  "status",
  "priority",
  "dueDate",
  "assigneeId",
] as const;

function TaskForm({
  task,
  onDone,
  projects,
  members,
  defaultProjectId,
}: Omit<TaskFormDialogProps, "open" | "onClose"> & { onDone: () => void }) {
  const { workspace } = useWorkspace();
  const toast = useToast();
  const create = useCreateTask(workspace.id);
  const update = useUpdateTask(task?.id ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? toTaskFormValues(task)
      : {
          projectId: defaultProjectId ?? projects[0]?.id ?? "",
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          dueDate: "",
          assigneeId: "",
        },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const input = toTaskInput(values);
    try {
      if (task) await update.mutateAsync(input);
      else await create.mutateAsync(input);
      toast.success(task ? "Task updated" : "Task created");
      onDone();
    } catch (error) {
      setFormError(applyApiError(error, setError, FIELDS));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogBody className="flex flex-col gap-4">
        <Field label="Title" error={errors.title?.message} required>
          <Input {...register("title")} data-autofocus autoComplete="off" />
        </Field>
        <Field label="Description" error={errors.description?.message}>
          <Textarea {...register("description")} rows={3} />
        </Field>
        <Field label="Project" error={errors.projectId?.message} required>
          <Select {...register("projectId")}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority" error={errors.priority?.message}>
            <Select {...register("priority")}>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {TASK_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assignee" error={errors.assigneeId?.message}>
            <Select {...register("assigneeId")}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due date" error={errors.dueDate?.message}>
            <Input type="date" {...register("dueDate")} />
          </Field>
        </div>
        {formError ? (
          <p role="alert" className="text-danger text-sm">
            {formError}
          </p>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : task ? "Save changes" : "Create task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
