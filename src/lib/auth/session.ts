import type { AuthSession } from "@/lib/api/http";
import { useAuthStore } from "@/lib/auth/store";
import { readRefreshToken, storeTokens, clearTokens } from "@/lib/auth/token-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Outcome of one POST /api/v1/auth/refresh attempt:
 *   - `refreshed` — new token pair stored, access token set on the store
 *   - `rejected` — no refresh token, or the backend refused it
 *   - `unreachable` — network failure; the stored refresh token may still be good
 */
export type RefreshOutcome = "refreshed" | "rejected" | "unreachable";

let inFlightRefresh: Promise<RefreshOutcome> | null = null;

/**
 * The single refresh implementation (used by the HTTP client's 401 retry
 * and by AuthProvider's silent restore on load). Deliberately a raw fetch,
 * not the HTTP client, so it can't recurse into its own 401 handling.
 *
 * De-duplicated via inFlightRefresh so concurrent 401s share one refresh
 * call instead of racing to rotate the same refresh token N times — the
 * backend revokes a refresh token the moment it's used (see
 * app/api/auth.py's refresh(): `stored.revoked = True`), so a second,
 * independent refresh call with the now-already-used token would 401.
 */
export function refreshSession(): Promise<RefreshOutcome> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async (): Promise<RefreshOutcome> => {
    const refreshToken = readRefreshToken();
    if (!refreshToken) return "rejected";

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) return "rejected";

      const data = (await response.json()) as { access_token: string; refresh_token: string };
      storeTokens(data.refresh_token);
      useAuthStore.getState().setAccessToken(data.access_token);
      return "refreshed";
    } catch {
      return "unreachable";
    }
  })().finally(() => {
    inFlightRefresh = null;
  });

  return inFlightRefresh;
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
    clearTokens();
    useAuthStore.getState().clearSession();
    return false;
  },
};
