/**
 * Refresh-token persistence. Per plans/README.md's decision: the refresh
 * token lives in localStorage (the access token stays in memory only, see
 * store.ts) so a page reload can attempt a silent refresh instead of
 * forcing a full re-login.
 *
 * Every access is wrapped defensively — localStorage can throw (private
 * browsing in some browsers, disabled storage) and this must never crash
 * the app; treat it the same as "no refresh token available."
 */
const REFRESH_TOKEN_KEY = "resume-saas:refresh-token";

export function readRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeTokens(refreshToken: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // Ignore — worst case the user has to log in again after a reload.
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore.
  }
}
