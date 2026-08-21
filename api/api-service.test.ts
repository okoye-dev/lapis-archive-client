import { describe, it, expect, beforeEach, vi } from "vitest";

// api-service reads a Supabase session for the auth header; it's wrapped in a
// try/catch, so a throwing stub just yields an anonymous request.
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => {
    throw new Error("no supabase in tests");
  },
}));

import { apiService, ApiError } from "@/api/api-service";

function mockFetch(status: number, jsonImpl: () => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => jsonImpl(),
    })) as unknown as typeof fetch,
  );
}

describe("apiService error handling", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("throws ApiError with the response's message field", async () => {
    mockFetch(404, () => ({ message: "nope" }));
    await expect(apiService.post("/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "nope",
    });
  });

  it("falls back to the error field", async () => {
    mockFetch(500, () => ({ error: "boom" }));
    await expect(apiService.post("/x")).rejects.toMatchObject({
      status: 500,
      message: "boom",
    });
  });

  it("uses a default message when the body isn't JSON", async () => {
    mockFetch(503, () => {
      throw new Error("bad json");
    });
    await expect(apiService.post("/x")).rejects.toMatchObject({
      status: 503,
      message: "HTTP error! status: 503",
    });
  });

  it("resolves parsed JSON on success", async () => {
    mockFetch(200, () => ({ hello: "world" }));
    await expect(apiService.get("/x")).resolves.toEqual({ hello: "world" });
  });

  it("ApiError is an Error subclass carrying the status", () => {
    const err = new ApiError(400, "bad");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
  });
});
