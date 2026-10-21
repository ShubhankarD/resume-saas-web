import type { AuthSession } from "@/lib/api/http";
import { useAuthStore } from "@/lib/auth/store";
import { createSessionRefresher, type RefreshOutcome } from "@/lib/auth/session-refresher";
import { readRefreshToken, storeTokens, clearTokens } from "@/lib/auth/token-storage";

export type { RefreshOutcome };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** The app's refresh, wired to the real fetch, storage and store. */
export const refreshSession = createSessionRefresher({
  baseUrl: API_BASE_URL,
  fetch: (...args) => fetch(...args),
  tokens: { read: readRefreshToken, store: storeTokens },
  setAccessToken: (token) => useAuthStore.getState().setAccessToken(token),
});

/** Forget the session locally: stored refresh token and in-memory auth state. */
export function discardLocalSession(): void {
  clearTokens();
  useAuthStore.getState().clearSession();
}

/**
 * The browser `AuthSession`: access token in memory (Zustand store),
 * refresh token in localStorage (plans/phase-F2-auth.md). A failed refresh
 * mid-session clears both so protected UI redirects to /login.
 */
export const browserAuthSession: AuthSession = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  async refresh() {
    const outcome = await refreshSession();
    if (outcome === "refreshed") return true;
    discardLocalSession();
    return false;
  },
};
