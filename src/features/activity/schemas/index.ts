import { z } from "zod";

export const activitySchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  actorId: z.string(),
  verb: z.enum(["created", "updated", "moved", "completed", "deleted"]),
  entityType: z.enum(["project", "task"]),
  entityName: z.string(),
  detail: z.string().nullable(),
  createdAt: z.string(),
});
export type Activity = z.infer<typeof activitySchema>;
