import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { RefreshOutcome } from "@/lib/auth/session";
import type { MeResponse } from "@/lib/auth/store";
import { createSessionLifecycle } from "./session-lifecycle";

const me = { display_name: "Jane" } as MeResponse;

function setup(
  opts: {
    outcome?: RefreshOutcome;
    fetchMe?: () => Promise<MeResponse>;
    accessToken?: string | null;
  } = {},
) {
  const calls: string[] = [];
  const state = {
    accessToken: opts.accessToken === undefined ? "new" : opts.accessToken,
    setAccessToken: vi.fn((t: string) => calls.push(`access:${t}`)),
    setSession: vi.fn((t: string) => calls.push(`session:${t}`)),
    clearSession: vi.fn(() => calls.push("clearSession")),
  };
  const tokens = {
    store: vi.fn((t: string) => calls.push(`store:${t}`)),
    clear: vi.fn(() => calls.push("clearTokens")),
  };
  const fetchMe = vi.fn(opts.fetchMe ?? (async () => (calls.push("me"), me)));
  const lifecycle = createSessionLifecycle({
    tokens,
    store: () => state,
    refresh: async () => opts.outcome ?? "refreshed",
    fetchMe,
  });
  return { lifecycle, calls, state, tokens, fetchMe };
}

describe("signIn", () => {
  it("stores the refresh token, sets the access token, then fetches /me", async () => {
    const { lifecycle, calls, state } = setup();
    await lifecycle.signIn("acc", "ref");
    expect(calls).toEqual(["store:ref", "access:acc", "me", "session:acc"]);
    expect(state.setSession).toHaveBeenCalledWith("acc", me);
  });
});

describe("restore", () => {
  it("settles into a session when refresh and /me succeed", async () => {
    const { lifecycle, state } = setup();
    await lifecycle.restore();
    expect(state.setSession).toHaveBeenCalledWith("new", me);
    expect(state.clearSession).not.toHaveBeenCalled();
  });

  it("discards the token when the backend rejects it", async () => {
    const { lifecycle, tokens, state, fetchMe } = setup({ outcome: "rejected" });
    await lifecycle.restore();
    expect(tokens.clear).toHaveBeenCalled();
    expect(state.clearSession).toHaveBeenCalled();
    expect(fetchMe).not.toHaveBeenCalled();
  });

  it("keeps the token on a network failure so the next load can retry", async () => {
    const { lifecycle, tokens, state } = setup({ outcome: "unreachable" });
    await lifecycle.restore();
    expect(tokens.clear).not.toHaveBeenCalled();
    expect(state.clearSession).toHaveBeenCalled();
  });

  it("drops the token when /me fails with an API error, keeps it otherwise", async () => {
    const api = setup({ fetchMe: async () => Promise.reject(new ApiError(401, "no")) });
    await api.lifecycle.restore();
    expect(api.tokens.clear).toHaveBeenCalled();
    expect(api.state.clearSession).toHaveBeenCalled();

    const net = setup({ fetchMe: async () => Promise.reject(new TypeError("offline")) });
    await net.lifecycle.restore();
    expect(net.tokens.clear).not.toHaveBeenCalled();
    expect(net.state.clearSession).toHaveBeenCalled();
  });

  it("clears the session instead of casting when no access token is present", async () => {
    const { lifecycle, state } = setup({ accessToken: null });
    await lifecycle.restore();
    expect(state.setSession).not.toHaveBeenCalled();
    expect(state.clearSession).toHaveBeenCalled();
  });
});
