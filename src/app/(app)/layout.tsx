"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { useLogout } from "@/lib/auth/use-logout";
import { Wordmark } from "@/components/wordmark";
import { AppHeader } from "@/components/app-shell/app-header";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { cn } from "cn";

/**
 * Protected app shell. Auth status lives client-side only (the access token
 * is in memory, not a server-readable cookie — see plans/README.md), so this
 * layout is a client component that redirects to /login once AuthProvider
 * has resolved the session as "unauthenticated." While the session is still
 * being checked (silent refresh in flight), it shows a brief loading state
 * rather than flashing protected content or redirecting prematurely.
 *
 * Composition follows spec §5: a full-width 56px application header above a
 * 240px sidebar and the main workspace. The page canvas is the light neutral
 * Surface 1 (§22); header and sidebar are Surface 2 panels separated by hairline
 * borders rather than shadows (§24).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6">
        <Wordmark className="text-2xl" />
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400"
          />
          <p data-testid="app-shell-checking" className="text-muted-foreground text-sm">
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader
        displayName={user?.display_name}
        email={user?.email}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        onLogout={() => void logout()}
      />

      <div className="flex min-h-0 w-full flex-1">
        <aside
          aria-label="Sidebar"
          className={cn(
            "border-border bg-sidebar sticky top-14 hidden h-[calc(100svh-3.5rem)] shrink-0 flex-col justify-between border-r py-3 transition-[width] duration-200 md:flex",
            collapsed ? "w-16 items-center px-3" : "w-60 px-3",
          )}
        >
          <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
            <SidebarNav collapsed={collapsed} />
          </div>

          {user && (
            <div className="border-border mt-3 shrink-0 border-t pt-3">
              {collapsed ? (
                <span data-testid="current-user" className="sr-only">
                  {user.email}
                </span>
              ) : (
                <div className="flex min-w-0 flex-col gap-0.5 px-3">
                  <span className="text-foreground truncate text-sm font-medium">
                    {user.display_name}
                  </span>
                  <span
                    data-testid="current-user"
                    className="text-muted-foreground truncate text-xs"
                  >
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-6 px-4 py-5 md:px-6 md:py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
