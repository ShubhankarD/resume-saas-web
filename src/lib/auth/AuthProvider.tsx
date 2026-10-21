"use client";

import { useEffect, useRef } from "react";
import { sessionLifecycle } from "@/lib/auth/browser-lifecycle";

/**
 * On mount, if a refresh token exists in localStorage, attempts a silent
 * restore (refresh + /auth/me) before protected content renders — see
 * session-lifecycle.ts and plans/phase-F2-auth.md. Shares refreshSession()
 * with the HTTP client's 401 retry, so there is one refresh implementation.
 *
 * Runs once for the lifetime of the app (StrictMode-safe via a ref guard).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void sessionLifecycle.restore();
  }, []);

  return <>{children}</>;
}
