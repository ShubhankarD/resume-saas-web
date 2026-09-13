import { create } from "zustand";
import type { components } from "@/lib/api/schema";

export type MeResponse = components["schemas"]["MeResponse"];

export type AuthStatus =
  | "checking" // initial silent-refresh attempt on app load, not yet resolved
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  accessToken: string | null;
  user: MeResponse | null;
  status: AuthStatus;
  setAccessToken: (token: string) => void;
  setSession: (accessToken: string, user: MeResponse) => void;
  setUser: (user: MeResponse) => void;
  clearSession: () => void;
}

/**
 * Auth-only client state (plans/README.md: "a small store — Zustand
 * suggested — for auth-only client state"). Deliberately a vanilla Zustand
 * store (not React Context) so it's readable/writable from apiFetch's
 * getAuthHeader()/401-retry logic outside the React tree, via
 * useAuthStore.getState()/.setState(), while components subscribe to it
 * normally with the hook.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "checking",
  setAccessToken: (token) => set({ accessToken: token, status: "authenticated" }),
  setSession: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),
  setUser: (user) => set({ user }),
  clearSession: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
}));
