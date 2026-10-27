"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useWorkspaces } from "../hooks";
import type { Workspace } from "../schemas";

const STORAGE_KEY = "flowboard:workspace";

interface WorkspaceContextValue {
  workspace: Workspace;
  workspaces: Workspace[];
  setWorkspaceId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readStoredId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Resolves the active workspace before rendering the app, so descendants can rely on it. */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: workspaces, error, refetch } = useWorkspaces();
  const [selectedId, setSelectedId] = useState<string | null>(readStoredId);

  const setWorkspaceId = useCallback((id: string) => {
    setSelectedId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Selection still applies for this session.
    }
  }, []);

  const value = useMemo<WorkspaceContextValue | null>(() => {
    const active = workspaces?.find((w) => w.id === selectedId) ?? workspaces?.[0];
    return workspaces && active ? { workspace: active, workspaces, setWorkspaceId } : null;
  }, [workspaces, selectedId, setWorkspaceId]);

  if (error) {
    return (
      <div className="mx-auto max-w-md pt-24">
        <ErrorState
          title="Couldn't load your workspace"
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!value) {
    return (
      <div className="p-6" aria-busy="true" aria-label="Loading workspace">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
}
