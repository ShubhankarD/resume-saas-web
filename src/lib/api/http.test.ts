import { describe, expect, it, vi } from "vitest";
import { ApiError, bearerAuth, createHttpClient, type AuthSession } from "@/lib/api/http";

function fakeSession(token: string | null, refreshTo: string | null): AuthSession {
  let current = token;
  return {
    getAccessToken: () => current,
    refresh: vi.fn(async () => {
      current = refreshTo;
      return refreshTo !== null;
    }),
  };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function authHeader(init: RequestInit | undefined) {
  return (init?.headers as Record<string, string> | undefined)?.Authorization;
}

describe("createHttpClient + bearerAuth", () => {
  it("injects the bearer token and parses JSON", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => json(200, { ok: true }));
    const http = createHttpClient({
      baseUrl: "http://api",
      fetch,
      middleware: [bearerAuth(fakeSession("t1", null))],
    });
    await expect(http.json("/x")).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith("http://api/x", expect.anything());
    expect(authHeader(fetch.mock.calls[0][1])).toBe("Bearer t1");
  });

  it("refreshes once on 401 and retries with the new token", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(json(401, { detail: "expired" }))
      .mockResolvedValueOnce(json(200, { ok: true }));
    const session = fakeSession("old", "new");
    const http = createHttpClient({ baseUrl: "", fetch, middleware: [bearerAuth(session)] });

    await expect(http.json("/x")).resolves.toEqual({ ok: true });
    expect(session.refresh).toHaveBeenCalledTimes(1);
    expect(authHeader(fetch.mock.calls[1][1])).toBe("Bearer new");
  });

  it("does not refresh an unauthenticated request", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      json(401, { detail: "bad credentials" }),
    );
    const session = fakeSession(null, "new");
    const http = createHttpClient({ baseUrl: "", fetch, middleware: [bearerAuth(session)] });

    await expect(http.json("/login")).rejects.toBeInstanceOf(ApiError);
    expect(session.refresh).not.toHaveBeenCalled();
  });

  it("surfaces the 401 when the refresh fails", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => json(401, { detail: "expired" }));
    const http = createHttpClient({
      baseUrl: "",
      fetch,
      middleware: [bearerAuth(fakeSession("old", null))],
    });
    await expect(http.json("/x")).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("reads an empty 204 with a JSON content-type as undefined", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(
      async () =>
        new Response(null, { status: 204, headers: { "content-type": "application/json" } }),
    );
    const http = createHttpClient({ baseUrl: "", fetch });
    await expect(http.json("/x", { method: "DELETE" })).resolves.toBeUndefined();
  });
});
