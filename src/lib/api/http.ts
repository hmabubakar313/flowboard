import type { z } from "zod";
import { buildQueryString, type ApiClient, type RequestOptions } from "./client";
import { ApiError, codeFromStatus, defaultMessage, type FieldErrors } from "./errors";

interface ErrorBody {
  message?: unknown;
  fieldErrors?: unknown;
}

function readFieldErrors(value: unknown): FieldErrors | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

async function readError(response: Response): Promise<ApiError> {
  const code = codeFromStatus(response.status);
  let body: ErrorBody = {};
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // Non-JSON error body: fall back to the default message for the status.
  }
  return new ApiError(
    code,
    typeof body.message === "string" ? body.message : defaultMessage(code),
    {
      status: response.status,
      fieldErrors: readFieldErrors(body.fieldErrors),
    },
  );
}

/** Talks to a real REST backend. Auth (e.g. cookies or bearer tokens) belongs here. */
export function createHttpClient(baseUrl: string): ApiClient {
  return {
    async request<T>(path: string, schema: z.ZodType<T>, options: RequestOptions = {}) {
      const { method = "GET", query, body, signal } = options;
      let response: Response;
      try {
        response = await fetch(`${baseUrl}${path}${buildQueryString(query)}`, {
          method,
          signal,
          headers: body === undefined ? undefined : { "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        throw new ApiError("network", defaultMessage("network"));
      }

      if (!response.ok) throw await readError(response);

      const payload: unknown = response.status === 204 ? undefined : await response.json();
      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        throw new ApiError("invalid_response", defaultMessage("invalid_response"), {
          status: response.status,
        });
      }
      return parsed.data;
    },
  };
}
