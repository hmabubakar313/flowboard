import { z } from "zod";
import { api } from "@/lib/api";
import { activitySchema } from "../schemas";

export const activityService = {
  list: (workspaceId: string, limit: number, signal?: AbortSignal) =>
    api.request("/activity", z.array(activitySchema), { query: { workspaceId, limit }, signal }),
};
