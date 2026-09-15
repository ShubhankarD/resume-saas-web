"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { useLogout } from "@/lib/auth/use-logout";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
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
      <div className="flex min-h-screen items-center justify-center">
        <p data-testid="app-shell-checking" className="text-muted-foreground text-sm">
          Checking your session…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "border-sidebar-border bg-sidebar sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center px-5">
          <Link href="/dashboard" className={cn(collapsed && "pointer-events-none opacity-0")}>
            <Wordmark className="text-lg" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav collapsed={collapsed} />
        </div>

        <div className="border-sidebar-border flex flex-col gap-3 border-t p-4">
          {user && !collapsed && (
            <div className="flex flex-col gap-0.5 px-1">
              <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {user.display_name}
              </span>
              <span data-testid="current-user" className="truncate text-xs text-slate-500">
                {user.email}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="justify-start gap-2 text-slate-500"
            onClick={() => logout()}
          >
            <LogOut className="size-4" />
            {!collapsed && "Log out"}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="border-border bg-background/80 sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-6 backdrop-blur-sm md:px-8">
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
          <div className="flex items-center md:hidden">
            <Link href="/dashboard">
              <Wordmark className="text-lg" />
            </Link>
          </div>
        </header>

        <div className="border-border overflow-x-auto border-b px-3 py-2 md:hidden">
          <SidebarNav orientation="horizontal" />
        </div>

        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
