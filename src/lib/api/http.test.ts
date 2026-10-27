import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "./errors";
import { createHttpClient } from "./http";

const client = createHttpClient("https://api.test");
const schema = z.object({ id: z.string() });

function respond(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

afterEach(() => vi.unstubAllGlobals());

describe("http client", () => {
  it("returns parsed data on success", async () => {
    respond({ id: "p_1" });
    await expect(client.request("/projects/p_1", schema)).resolves.toEqual({ id: "p_1" });
  });

  it("reports a network failure as a transient error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await failure(client.request("/projects", schema));
    expect(error.code).toBe("network");
    expect(error.isTransient).toBe(true);
  });

  it("surfaces field errors from a validation response", async () => {
    respond({ message: "Invalid", fieldErrors: { title: "Too long" } }, 422);
    const error = await failure(client.request("/tasks", schema, { method: "POST", body: {} }));
    expect(error.code).toBe("validation");
    expect(error.fieldErrors).toEqual({ title: "Too long" });
  });

  it("maps 404 and 500 to distinct codes", async () => {
    respond({}, 404);
    expect((await failure(client.request("/x", schema))).code).toBe("not_found");
    respond({}, 500);
    expect((await failure(client.request("/x", schema))).code).toBe("server");
  });

  it("rejects a response that doesn't match the expected shape", async () => {
    respond({ unexpected: true });
    expect((await failure(client.request("/x", schema))).code).toBe("invalid_response");
  });
});
