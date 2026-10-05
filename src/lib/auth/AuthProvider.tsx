"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/auth/store";
import { clearTokens } from "@/lib/auth/token-storage";
import { refreshSession } from "@/lib/auth/session";
import { getMe } from "@/lib/auth/api";
import { ApiError } from "@/lib/api/client";

/**
 * On mount, if a refresh token exists in localStorage, attempts a silent
 * refresh (+ fetches /auth/me) to restore the session before rendering
 * protected content — see plans/phase-F2-auth.md. Shares refreshSession()
 * with the HTTP client's 401 retry, so there is one refresh implementation.
 *
 * Runs once for the lifetime of the app (StrictMode-safe via a ref guard).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ran = useRef(false);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function restoreSession() {
      const outcome = await refreshSession();
      if (outcome !== "refreshed") {
        // A network failure ("unreachable") keeps the stored refresh token
        // so the next load can try again; a rejection discards it.
        if (outcome === "rejected") clearTokens();
        clearSession();
        return;
      }

      try {
        // refreshSession() already set the access token on the store, so
        // getMe()'s apiFetch call picks it up as the Authorization header.
        const user = await getMe();
        setSession(useAuthStore.getState().accessToken as string, user);
      } catch (err) {
        if (err instanceof ApiError) {
          clearTokens();
        }
        clearSession();
      }
    }

    void restoreSession();
  }, [setSession, clearSession]);

  return <>{children}</>;
}
