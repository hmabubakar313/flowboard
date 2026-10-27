import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { activityKeys } from "@/features/activity/hooks";
import type { Task, TaskInput, TaskStatus } from "../schemas";
import { tasksService, type TaskFilters } from "../services";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
};

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: ({ signal }) => tasksService.list(filters, signal),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateTaskData() {
  const queryClient = useQueryClient();
  // Not awaited: the mutation settles as soon as the server answers, and lists refresh in the background.
  return () => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: taskKeys.all }),
      // Project lists carry task counts, so they go stale when tasks change.
      queryClient.invalidateQueries({ queryKey: ["projects"] }),
      queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    ]);
  };
}

export function useCreateTask(workspaceId: string) {
  const invalidate = useInvalidateTaskData();
  return useMutation({
    mutationFn: (input: TaskInput) => tasksService.create(workspaceId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateTask(id: string) {
  const invalidate = useInvalidateTaskData();
  return useMutation({
    mutationFn: (input: Partial<TaskInput>) => tasksService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTaskData();
  return useMutation({
    mutationFn: (id: string) => tasksService.remove(id),
    onSuccess: invalidate,
  });
}

interface StatusChange {
  id: string;
  status: TaskStatus;
}

/**
 * Status changes are optimistic: the row moves immediately and rolls back if the
 * request fails. The caller decides how to tell the user (see onError).
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTaskData();

  return useMutation({
    mutationFn: ({ id, status }: StatusChange) => tasksService.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const snapshot = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.lists() });
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (tasks) =>
        tasks?.map((task) => (task.id === id ? { ...task, status } : task)),
      );
      return { snapshot };
    },
    onError: (_error, _change, context) => {
      context?.snapshot.forEach(([key, data]: [QueryKey, Task[] | undefined]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: invalidate,
  });
}
