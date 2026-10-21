/**
 * Outcome of one POST /api/v1/auth/refresh attempt:
 *   - `refreshed` — new token pair stored, access token set on the store
 *   - `rejected` — no refresh token, or the backend refused it
 *   - `unreachable` — network failure; the stored refresh token may still be good
 */
export type RefreshOutcome = "refreshed" | "rejected" | "unreachable";

export interface RefresherDeps {
  baseUrl: string;
  fetch: typeof fetch;
  tokens: { read(): string | null; store(refreshToken: string): void };
  setAccessToken(accessToken: string): void;
}

function isTokenPair(data: unknown): data is { access_token: string; refresh_token: string } {
  if (typeof data !== "object" || data === null) return false;
  const pair = data as Record<string, unknown>;
  return typeof pair.access_token === "string" && typeof pair.refresh_token === "string";
}

/**
 * The single refresh implementation (used by the HTTP client's 401 retry
 * and by the session lifecycle's silent restore). Deliberately a raw fetch,
 * not the HTTP client, so it can't recurse into its own 401 handling.
 *
 * De-duplicated while in flight so concurrent 401s share one refresh call
 * instead of racing to rotate the same refresh token N times — the backend
 * revokes a refresh token the moment it's used (see app/api/auth.py's
 * refresh(): `stored.revoked = True`), so a second, independent call with
 * the now-used token would 401.
 */
export function createSessionRefresher({
  baseUrl,
  fetch: doFetch,
  tokens,
  setAccessToken,
}: RefresherDeps): () => Promise<RefreshOutcome> {
  let inFlight: Promise<RefreshOutcome> | null = null;

  async function attempt(): Promise<RefreshOutcome> {
    const refreshToken = tokens.read();
    if (!refreshToken) return "rejected";

    try {
      const response = await doFetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) return "rejected";

      const data: unknown = await response.json();
      if (!isTokenPair(data)) return "rejected";
      tokens.store(data.refresh_token);
      setAccessToken(data.access_token);
      return "refreshed";
    } catch {
      return "unreachable";
    }
  }

  return () => {
    inFlight ??= attempt().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}
