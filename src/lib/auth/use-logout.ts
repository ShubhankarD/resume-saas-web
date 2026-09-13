"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { clearTokens, readRefreshToken } from "@/lib/auth/token-storage";
import { logoutRequest } from "@/lib/auth/api";

/**
 * Logs out: best-effort revokes the refresh token server-side (see
 * app/api/auth.py's logout()), then clears local session state regardless
 * of whether that call succeeds — a network hiccup shouldn't leave the user
 * stuck "logged in" client-side with a token that no longer works.
 */
export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return async function logout() {
    const refreshToken = readRefreshToken();
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Ignore — we clear the local session either way.
      }
    }
    clearTokens();
    clearSession();
    router.push("/login");
  };
}
