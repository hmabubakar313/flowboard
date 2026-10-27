import { z } from "zod";
import { isValidDay } from "@/lib/utils/dates";

export const TASK_STATUSES = ["todo", "in_progress", "in_review", "done"] as const;
export const taskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const TASK_PRIORITIES = ["urgent", "high", "medium", "low"] as const;
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const taskSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  projectId: z.string(),
  number: z.number(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.string().nullable(),
  assigneeId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

export const taskInputSchema = z.object({
  projectId: z.string().min(1, "Choose a project"),
  title: z
    .string()
    .trim()
    .min(1, "Enter a task title")
    .max(120, "Keep the title under 120 characters"),
  description: z.string().trim().max(1000, "Keep the description under 1,000 characters"),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.string().refine(isValidDay, "Enter a valid date").nullable(),
  assigneeId: z.string().nullable(),
});
export type TaskInput = z.infer<typeof taskInputSchema>;

export const taskFormSchema = taskInputSchema.extend({
  dueDate: z.string().refine((v) => v === "" || isValidDay(v), "Enter a valid date"),
  assigneeId: z.string(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

export function toTaskInput(values: TaskFormValues): TaskInput {
  return {
    ...values,
    dueDate: values.dueDate === "" ? null : values.dueDate,
    assigneeId: values.assigneeId === "" ? null : values.assigneeId,
  };
}

export function toTaskFormValues(task: Task): TaskFormValues {
  return {
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? "",
    assigneeId: task.assigneeId ?? "",
  };
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};
