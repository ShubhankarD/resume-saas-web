"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { useLogout } from "@/lib/auth/use-logout";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { cn } from "cn";

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

  const initial = (user?.display_name || user?.email || "").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "border-border bg-sidebar sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r transition-[width,padding] duration-200 md:flex",
          collapsed ? "w-[76px] px-3 py-5" : "w-64 p-5",
        )}
      >
        <div className="flex min-h-0 flex-col gap-6">
          <div className={cn("flex h-10 shrink-0 items-center", collapsed ? "justify-center" : "px-2")}>
            <Link
              href="/dashboard"
              aria-label="resumeaid — go to dashboard"
              className={cn(collapsed && "pointer-events-none opacity-0")}
            >
              <Wordmark className="text-lg" />
            </Link>
          </div>

          <div className="-mx-1 flex-1 overflow-y-auto px-1">
            <SidebarNav collapsed={collapsed} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 pt-4">
          {user && !collapsed && (
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-foreground truncate text-sm font-medium">
                {user.display_name}
              </span>
              <span data-testid="current-user" className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon-sm" : "sm"}
            className={cn("text-muted-foreground gap-2", collapsed ? "self-center" : "justify-start")}
            onClick={() => logout()}
            aria-label={collapsed ? "Log out" : undefined}
            title={collapsed ? "Log out" : undefined}
          >
            <LogOut className="size-4" />
            {!collapsed && "Log out"}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="border-border bg-background/70 sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-6 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <MobileNav
              displayName={user?.display_name}
              email={user?.email}
              onLogout={() => void logout()}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-[18px]" />
              ) : (
                <PanelLeftClose className="size-[18px]" />
              )}
            </Button>
            <Link href="/dashboard" className="min-w-0 md:hidden">
              <Wordmark className="text-lg" />
            </Link>
          </div>

          {user && (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="text-muted-foreground hidden min-w-0 truncate text-sm sm:inline">
                {user.display_name}
              </span>
              <span
                aria-hidden
                className="bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              >
                {initial}
              </span>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
