import type { z } from "zod";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * The single seam between the UI and a data source. Every response is parsed
 * with the supplied schema, so callers receive typed data or an ApiError.
 * Implementations: HttpClient (real backend) and the mock client in src/mocks.
 */
export interface ApiClient {
  request<T>(path: string, schema: z.ZodType<T>, options?: RequestOptions): Promise<T>;
}

export function buildQueryString(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}
