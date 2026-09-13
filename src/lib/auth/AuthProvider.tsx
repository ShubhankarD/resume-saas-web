"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/auth/store";
import { readRefreshToken, storeTokens, clearTokens } from "@/lib/auth/token-storage";
import { getMe } from "@/lib/auth/api";
import { ApiError } from "@/lib/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * On mount, if a refresh token exists in localStorage, attempts a silent
 * refresh (+ fetches /auth/me) to restore the session before rendering
 * protected content — see plans/phase-F2-auth.md. Uses a raw fetch for the
 * initial refresh (not apiFetch) since there's no access token yet to make
 * apiFetch's 401-retry path meaningful here.
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
      const refreshToken = readRefreshToken();
      if (!refreshToken) {
        clearSession();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
          clearTokens();
          clearSession();
          return;
        }

        const data = (await response.json()) as { access_token: string; refresh_token: string };
        storeTokens(data.refresh_token);
        // Set the access token directly on the store (not via setSession)
        // so getMe()'s apiFetch call below picks it up as the Authorization
        // header.
        useAuthStore.getState().setAccessToken(data.access_token);

        const user = await getMe();
        setSession(data.access_token, user);
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
