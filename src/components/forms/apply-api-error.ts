import { toApiError } from "@/lib/api";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

/**
 * Maps a failed submit onto the form: server field errors attach to their inputs,
 * anything else is returned as a message for the form-level alert.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly FieldPath<T>[],
): string | null {
  const apiError = toApiError(error);
  let mapped = 0;
  for (const field of fields) {
    const message = apiError.fieldErrors?.[field];
    if (message) {
      setError(field, { message });
      mapped++;
    }
  }
  return mapped > 0 ? null : apiError.message;
}
