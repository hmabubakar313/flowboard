import { z } from "zod";
import { isValidDay } from "@/lib/utils/dates";

export const PROJECT_STATUSES = ["planning", "active", "on_hold", "completed"] as const;
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  description: z.string(),
  status: projectStatusSchema,
  deadline: z.string().nullable(),
  ownerId: z.string(),
  taskCount: z.number(),
  doneCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

/** Wire format for create/update requests. Also enforced by the mock backend. */
export const projectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a project name")
    .max(80, "Keep the name under 80 characters"),
  description: z.string().trim().max(500, "Keep the description under 500 characters"),
  status: projectStatusSchema,
  deadline: z.string().refine(isValidDay, "Enter a valid date").nullable(),
  ownerId: z.string().min(1, "Choose an owner"),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

/** Form values: dates are plain strings, "" means no deadline. */
export const projectFormSchema = projectInputSchema.extend({
  deadline: z.string().refine((v) => v === "" || isValidDay(v), "Enter a valid date"),
});
export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function toProjectInput(values: ProjectFormValues): ProjectInput {
  return { ...values, deadline: values.deadline === "" ? null : values.deadline };
}

export function toProjectFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    description: project.description,
    status: project.status,
    deadline: project.deadline ?? "",
    ownerId: project.ownerId,
  };
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
};
