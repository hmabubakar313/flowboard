"use client";

import { applyApiError } from "@/components/forms/apply-api-error";
import { Field } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toast";
import { useMembers } from "@/features/workspace/hooks";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateProject, useUpdateProject } from "../hooks";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  projectFormSchema,
  toProjectFormValues,
  toProjectInput,
  type Project,
  type ProjectFormValues,
} from "../schemas";

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** When provided, the dialog edits this project instead of creating one. */
  project?: Project;
}

export function ProjectFormDialog({ open, onClose, project }: ProjectFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={project ? "Edit project" : "New project"}
      description={project ? undefined : "Projects group related tasks and share a deadline."}
    >
      <ProjectForm project={project} onDone={onClose} />
    </Dialog>
  );
}

const FIELDS = ["name", "description", "status", "deadline", "ownerId"] as const;

function ProjectForm({ project, onDone }: { project?: Project; onDone: () => void }) {
  const { workspace } = useWorkspace();
  const { data: members = [] } = useMembers();
  const toast = useToast();
  const create = useCreateProject(workspace.id);
  const update = useUpdateProject(project?.id ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? toProjectFormValues(project)
      : { name: "", description: "", status: "planning", deadline: "", ownerId: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const input = toProjectInput(values);
    try {
      if (project) await update.mutateAsync(input);
      else await create.mutateAsync(input);
      toast.success(project ? "Project updated" : "Project created");
      onDone();
    } catch (error) {
      setFormError(applyApiError(error, setError, FIELDS));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogBody className="flex flex-col gap-4">
        <Field label="Name" error={errors.name?.message} required>
          <Input {...register("name")} data-autofocus autoComplete="off" />
        </Field>
        <Field label="Description" error={errors.description?.message}>
          <Textarea {...register("description")} rows={3} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PROJECT_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Deadline" error={errors.deadline?.message}>
            <Input type="date" {...register("deadline")} />
          </Field>
        </div>
        <Field label="Owner" error={errors.ownerId?.message} required>
          <Select {...register("ownerId")}>
            <option value="">Choose an owner</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        </Field>
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
          {isSubmitting ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
      </DialogFooter>
    </form>
  );
}
