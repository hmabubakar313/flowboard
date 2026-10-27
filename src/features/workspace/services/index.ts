import { z } from "zod";
import { api } from "@/lib/api";
import { memberSchema, workspaceSchema } from "../schemas";

export const workspaceService = {
  me: (signal?: AbortSignal) => api.request("/me", memberSchema, { signal }),
  members: (signal?: AbortSignal) => api.request("/members", z.array(memberSchema), { signal }),
  workspaces: (signal?: AbortSignal) =>
    api.request("/workspaces", z.array(workspaceSchema), { signal }),
};
