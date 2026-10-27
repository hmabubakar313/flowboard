import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "../services";

export const workspaceKeys = {
  me: ["me"] as const,
  members: ["members"] as const,
  workspaces: ["workspaces"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: workspaceKeys.me,
    queryFn: ({ signal }) => workspaceService.me(signal),
    staleTime: Infinity,
  });
}

export function useMembers() {
  return useQuery({
    queryKey: workspaceKeys.members,
    queryFn: ({ signal }) => workspaceService.members(signal),
    staleTime: Infinity,
  });
}

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.workspaces,
    queryFn: ({ signal }) => workspaceService.workspaces(signal),
    staleTime: Infinity,
  });
}
