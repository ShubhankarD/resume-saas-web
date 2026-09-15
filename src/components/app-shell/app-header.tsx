"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { UserMenu } from "@/components/app-shell/user-menu";

/**
 * Top application header (spec §5/§6). Spans the full window width above the
 * sidebar and workspace, 56px tall, and holds only chrome: the wordmark and
 * the navigation affordances on the left, account controls on the right.
 * Page-specific actions deliberately live in contextual page headers and
 * toolbars instead — §6 warns against overloading this bar.
 */
export function AppHeader({
  displayName,
  email,
  collapsed,
  onToggleCollapsed,
  onLogout,
}: {
  displayName?: string;
  email?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="border-border bg-card sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-1">
        <MobileNav displayName={displayName} email={email} onLogout={onLogout} />

        <Link
          href="/dashboard"
          aria-label="resumeaid — go to dashboard"
          className="focus-visible:ring-ring/40 min-w-0 rounded-md px-1 py-1 outline-none focus-visible:ring-2"
        >
          <Wordmark className="text-lg" />
        </Link>

        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-1 hidden md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" />
          ) : (
            <PanelLeftClose className="size-[18px]" />
          )}
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-muted-foreground hidden max-w-[16rem] truncate text-sm sm:inline">
          {displayName}
        </span>
        <UserMenu displayName={displayName} email={email} onLogout={onLogout} />
      </div>
    </header>
  );
}
