import type { z } from "zod";
import type { ApiClient, RequestOptions } from "./client";
import { createHttpClient } from "./http";

export type { ApiClient, RequestOptions } from "./client";
export { ApiError, getErrorMessage, toApiError } from "./errors";

function createClient(): ApiClient {
  if (process.env.NEXT_PUBLIC_API_MODE === "http") {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl)
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required when NEXT_PUBLIC_API_MODE=http");
    return createHttpClient(baseUrl);
  }
  // The mock backend is loaded lazily so it stays out of http-mode bundles.
  return {
    async request<T>(path: string, schema: z.ZodType<T>, options?: RequestOptions) {
      const { mockClient } = await import("@/mocks/mock-client");
      return mockClient.request(path, schema, options);
    },
  };
}

export const api: ApiClient = createClient();
