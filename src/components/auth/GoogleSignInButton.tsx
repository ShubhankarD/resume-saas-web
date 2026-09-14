"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Minimal typing for the bit of the Google Identity Services (GIS) JS API
 * this component uses. Verified against Google's current live docs
 * (developers.google.com/identity/gsi/web/reference/js-reference and
 * .../guides/display-button) rather than assumed from memory — see the PR
 * description for what was confirmed. There is no official npm/@types
 * package for this; GIS is loaded as a plain script that defines
 * `window.google.accounts.id`.
 */
interface CredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    ux_mode?: "popup" | "redirect";
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black" | "outline_dark";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
    },
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

interface GoogleSignInButtonProps {
  onIdToken: (idToken: string) => void;
  disabled?: boolean;
}

/**
 * Whether Google sign-in has a client ID configured. Callers use this to
 * decide whether to render the "or" divider around <GoogleSignInButton />
 * at all — the button itself renders nothing when unconfigured, but the
 * divider needs the same check so it doesn't appear above an empty gap.
 */
export function isGoogleSignInConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
}

/**
 * Renders Google's own "Sign in with Google" button via the Identity
 * Services JS client and hands the resulting ID token (JWT) up to the
 * caller, which POSTs it to /api/v1/auth/google as {"id_token": ...} — see
 * app/schemas/auth.py's GoogleAuthRequest. This is the client-side
 * credential flow (a button hands us an ID token directly), not a
 * server-side OAuth redirect/callback.
 *
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set. If it isn't (expected in
 * this dev environment, which has no real Google OAuth credentials), the
 * button area shows an explanatory message instead of silently rendering
 * nothing or faking a working demo.
 */
export function GoogleSignInButton({ onIdToken, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || disabled) return;
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onIdToken(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 320,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load Google Sign-In. Try again later.");
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, disabled, onIdToken]);

  if (!clientId) {
    // No implementation detail (env var names, etc.) in user-facing copy —
    // simplest correct behavior is to omit the Google option entirely when
    // it isn't configured, rather than exposing internal config to users.
    return null;
  }

  if (error) {
    return <p className="text-destructive text-xs">{error}</p>;
  }

  return <div ref={containerRef} data-testid="google-signin-button" />;
}
