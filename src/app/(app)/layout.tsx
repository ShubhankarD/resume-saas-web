"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { useLogout } from "@/lib/auth/use-logout";
import { Button } from "@/components/ui/button";

/**
 * Protected app shell. Auth status lives client-side only (the access token
 * is in memory, not a server-readable cookie — see plans/README.md), so this
 * layout is a client component that redirects to /login once AuthProvider
 * has resolved the session as "unauthenticated." While the session is still
 * being checked (silent refresh in flight), it shows a brief loading state
 * rather than flashing protected content or redirecting prematurely.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p data-testid="app-shell-checking" className="text-muted-foreground text-sm">
          Checking your session…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          resume-saas
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/content" className="text-muted-foreground hover:text-foreground text-sm">
            Content
          </Link>
          <Link href="/profiles" className="text-muted-foreground hover:text-foreground text-sm">
            Profiles
          </Link>
          <Link href="/jds" className="text-muted-foreground hover:text-foreground text-sm">
            Job descriptions
          </Link>
          <Link href="/evaluations" className="text-muted-foreground hover:text-foreground text-sm">
            Evaluations
          </Link>
          {user && (
            <span data-testid="current-user" className="text-muted-foreground text-sm">
              {user.display_name}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
