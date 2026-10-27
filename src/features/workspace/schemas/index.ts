import { z } from "zod";

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
});
export type Member = z.infer<typeof memberSchema>;

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: z.string(),
});
export type Workspace = z.infer<typeof workspaceSchema>;
