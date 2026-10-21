import { describe, expect, it, vi } from "vitest";
import { createSessionRefresher } from "./session-refresher";

function setup(opts: { token?: string | null; respond?: () => Promise<Response> } = {}) {
  const respond =
    opts.respond ??
    (async () => Response.json({ access_token: "new-access", refresh_token: "new-refresh" }));
  const fetchMock = vi.fn<typeof fetch>(() => respond());
  const tokens = {
    read: vi.fn(() => (opts.token === undefined ? "old-refresh" : opts.token)),
    store: vi.fn(),
  };
  const setAccessToken = vi.fn();
  const refresh = createSessionRefresher({
    baseUrl: "http://api",
    fetch: fetchMock,
    tokens,
    setAccessToken,
  });
  return { refresh, fetchMock, tokens, setAccessToken };
}

describe("createSessionRefresher", () => {
  it("posts the stored token and stores the rotated pair", async () => {
    const { refresh, fetchMock, tokens, setAccessToken } = setup();
    await expect(refresh()).resolves.toBe("refreshed");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api/api/v1/auth/refresh");
    expect(JSON.parse(String(init?.body))).toEqual({ refresh_token: "old-refresh" });
    expect(tokens.store).toHaveBeenCalledWith("new-refresh");
    expect(setAccessToken).toHaveBeenCalledWith("new-access");
  });

  it("is rejected without calling the backend when no token is stored", async () => {
    const { refresh, fetchMock } = setup({ token: null });
    await expect(refresh()).resolves.toBe("rejected");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("is rejected on a non-OK or malformed response, storing nothing", async () => {
    const bad = setup({ respond: async () => new Response("no", { status: 401 }) });
    await expect(bad.refresh()).resolves.toBe("rejected");
    const malformed = setup({ respond: async () => Response.json({ access_token: 1 }) });
    await expect(malformed.refresh()).resolves.toBe("rejected");
    expect(malformed.tokens.store).not.toHaveBeenCalled();
    expect(malformed.setAccessToken).not.toHaveBeenCalled();
  });

  it("reports a network failure as unreachable", async () => {
    const { refresh } = setup({ respond: () => Promise.reject(new TypeError("offline")) });
    await expect(refresh()).resolves.toBe("unreachable");
  });

  it("shares one in-flight call, then allows a new one", async () => {
    const { refresh, fetchMock } = setup();
    const [a, b] = await Promise.all([refresh(), refresh()]);
    expect([a, b]).toEqual(["refreshed", "refreshed"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await refresh();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
