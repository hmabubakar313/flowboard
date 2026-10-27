import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/features/activity/hooks";
import { taskKeys } from "@/features/tasks/hooks";
import type { ProjectInput } from "../schemas";
import { projectsService, type ProjectFilters } from "../services";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: ({ signal }) => projectsService.list(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: ({ signal }) => projectsService.get(id, signal),
  });
}

function useInvalidateProjectData() {
  const queryClient = useQueryClient();
  // Not awaited: the mutation settles as soon as the server answers, and lists refresh in the background.
  return () => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: projectKeys.all }),
      queryClient.invalidateQueries({ queryKey: taskKeys.all }),
      queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    ]);
  };
}

export function useCreateProject(workspaceId: string) {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: (input: ProjectInput) => projectsService.create(workspaceId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateProject(id: string) {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: (input: Partial<ProjectInput>) => projectsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    onSuccess: invalidate,
  });
}
