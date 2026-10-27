"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Keeps list filters in the URL so views are shareable and survive reloads.
 * Values are always strings ("" when unset); callers validate them against their own enums.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const values = {} as Record<K, string>; // filled for every key just below
  for (const key of keys) values[key] = searchParams.get(key) ?? "";

  const setFilters = useCallback(
    (patch: Partial<Record<K, string>>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries<string | undefined>(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const hasActiveFilters = keys.some((key) => values[key] !== "");
  return { values, setFilters, hasActiveFilters };
}
