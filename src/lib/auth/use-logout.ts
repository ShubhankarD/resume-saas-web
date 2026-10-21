"use client";

import { useRouter } from "next/navigation";
import { discardLocalSession } from "@/lib/auth/session";
import { readRefreshToken } from "@/lib/auth/token-storage";
import { logoutRequest } from "@/lib/auth/api";

/**
 * Logs out: best-effort revokes the refresh token server-side (see
 * app/api/auth.py's logout()), then clears local session state regardless
 * of whether that call succeeds — a network hiccup shouldn't leave the user
 * stuck "logged in" client-side with a token that no longer works.
 */
export function useLogout() {
  const router = useRouter();

  return async function logout() {
    const refreshToken = readRefreshToken();
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Ignore — we clear the local session either way.
      }
    }
    discardLocalSession();
    router.push("/login");
  };
}
