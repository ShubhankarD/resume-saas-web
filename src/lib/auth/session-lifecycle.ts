import { ApiError } from "@/lib/api/client";
import type { RefreshOutcome } from "@/lib/auth/session";
import type { MeResponse } from "@/lib/auth/store";

/**
 * How a session starts: signing in with a fresh token pair, or silently
 * restoring one on page load. The flows are written against these small
 * ports (token persistence, the auth store, refresh, /me) instead of
 * localStorage, Zustand and fetch, so they run in a plain unit test.
 */

export interface SessionDeps {
  tokens: { store(refreshToken: string): void; clear(): void };
  store: () => {
    accessToken: string | null;
    setAccessToken(token: string): void;
    setSession(accessToken: string, user: MeResponse): void;
    clearSession(): void;
  };
  refresh(): Promise<RefreshOutcome>;
  fetchMe(): Promise<MeResponse>;
}

export function createSessionLifecycle({ tokens, store, refresh, fetchMe }: SessionDeps) {
  return {
    /**
     * Persists the pair and enters the authenticated state. The access token
     * goes on the store *before* `/me` so that request is authorised.
     */
    async signIn(accessToken: string, refreshToken: string): Promise<void> {
      tokens.store(refreshToken);
      store().setAccessToken(accessToken);
      store().setSession(accessToken, await fetchMe());
    },

    /**
     * Silent restore from the stored refresh token. A network failure keeps
     * the token so the next load can retry; a rejection or an API error on
     * `/me` discards it. Always ends in a settled auth status.
     */
    async restore(): Promise<void> {
      const outcome = await refresh();
      if (outcome !== "refreshed") {
        if (outcome === "rejected") tokens.clear();
        store().clearSession();
        return;
      }

      try {
        const user = await fetchMe();
        const accessToken = store().accessToken;
        if (accessToken) store().setSession(accessToken, user);
        else store().clearSession();
      } catch (err) {
        if (err instanceof ApiError) tokens.clear();
        store().clearSession();
      }
    },
  };
}
