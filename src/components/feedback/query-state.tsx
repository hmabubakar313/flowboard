"use client";

import { getErrorMessage } from "@/lib/api";
import type { ReactNode } from "react";
import { ErrorState } from "./error-state";

interface QueryLike<T> {
  data: T | undefined;
  error: Error | null;
  refetch: () => unknown;
}

interface QueryStateProps<T> {
  query: QueryLike<T>;
  skeleton: ReactNode;
  errorTitle?: string;
  /** Rendered instead of children when this returns true for the loaded data. */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/** One place that decides between loading, error, empty and success for a query. */
export function QueryState<T>({
  query,
  skeleton,
  errorTitle,
  isEmpty,
  empty,
  children,
}: QueryStateProps<T>) {
  const { data, error, refetch } = query;
  if (data === undefined) {
    if (error) {
      return (
        <ErrorState
          title={errorTitle}
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      );
    }
    return <div aria-busy="true">{skeleton}</div>;
  }
  if (isEmpty?.(data)) return <>{empty}</>;
  return <>{children(data)}</>;
}
