import type { z } from "zod";
import type { ApiClient, RequestOptions } from "@/lib/api/client";
import { ApiError, defaultMessage, toApiError } from "@/lib/api/errors";
import { getDb, saveDb } from "./db";
import { handlers } from "./handlers";

const FAILURE_KEY = "flowboard:mock-fail";

export interface MockClientOptions {
  /** Simulated network latency range in milliseconds. */
  latency?: [min: number, max: number];
}

interface Route {
  key: string;
  method: string;
  pattern: RegExp;
  paramNames: string[];
}

const routes: Route[] = Object.keys(handlers).map((key) => {
  const [method = "", path = ""] = key.split(" ");
  const paramNames: string[] = [];
  const source = path.replace(/:(\w+)/g, (_, name: string) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  return { key, method, pattern: new RegExp(`^${source}$`), paramNames };
});

/** Bootstrap data the shell needs to render at all; failing it would hide the states we want to show. */
const BOOTSTRAP_PATHS = new Set(["/me", "/members", "/workspaces"]);

export function isFailureSimulated(): boolean {
  try {
    return window.localStorage.getItem(FAILURE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setFailureSimulated(enabled: boolean): void {
  try {
    if (enabled) window.localStorage.setItem(FAILURE_KEY, "1");
    else window.localStorage.removeItem(FAILURE_KEY);
  } catch {
    // Ignore: the toggle simply won't persist.
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function createMockClient(options: MockClientOptions = {}): ApiClient {
  const [minLatency, maxLatency] = options.latency ?? [180, 520];

  return {
    async request<T>(path: string, schema: z.ZodType<T>, request: RequestOptions = {}) {
      const { method = "GET", query = {}, body, signal } = request;
      await wait(minLatency + Math.random() * (maxLatency - minLatency), signal);

      if (isFailureSimulated() && !BOOTSTRAP_PATHS.has(path))
        throw new ApiError("network", defaultMessage("network"));

      let route: Route | undefined;
      let match: RegExpExecArray | null = null;
      for (const candidate of routes) {
        if (candidate.method !== method) continue;
        match = candidate.pattern.exec(path);
        if (match) {
          route = candidate;
          break;
        }
      }
      const handler = route && handlers[route.key];
      if (!route || !match || !handler) {
        throw new ApiError("not_found", `No route for ${method} ${path}`, { status: 404 });
      }

      const params = Object.fromEntries(
        route.paramNames.map((name, index) => [name, decodeURIComponent(match[index + 1] ?? "")]),
      );
      const normalisedQuery = Object.fromEntries(
        Object.entries(query).map(([key, value]) => [
          key,
          value === undefined ? undefined : String(value),
        ]),
      );

      let result: unknown;
      try {
        result = handler({ db: getDb(), params, query: normalisedQuery, body });
      } catch (error) {
        throw toApiError(error);
      }
      if (method !== "GET") saveDb();

      // Round-trip through JSON so callers never share references with the store,
      // exactly as they wouldn't with a real network response.
      const wire: unknown = result === undefined ? undefined : JSON.parse(JSON.stringify(result));
      const parsed = schema.safeParse(wire);
      if (!parsed.success) {
        throw new ApiError("invalid_response", defaultMessage("invalid_response"));
      }
      return parsed.data;
    },
  };
}

export const mockClient = createMockClient();
