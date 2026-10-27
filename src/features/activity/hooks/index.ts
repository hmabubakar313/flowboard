import { useQuery } from "@tanstack/react-query";
import { activityService } from "../services";

export const activityKeys = {
  all: ["activity"] as const,
  list: (workspaceId: string, limit: number) => [...activityKeys.all, workspaceId, limit] as const,
};

export function useActivity(workspaceId: string, limit = 8) {
  return useQuery({
    queryKey: activityKeys.list(workspaceId, limit),
    queryFn: ({ signal }) => activityService.list(workspaceId, limit, signal),
  });
}
