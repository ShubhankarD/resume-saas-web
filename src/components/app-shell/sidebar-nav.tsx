"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  LayoutDashboard,
  FileText,
  UserRound,
  Briefcase,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/profiles", label: "Profiles", icon: UserRound },
  { href: "/jds", label: "Job descriptions", icon: Briefcase },
  { href: "/evaluations", label: "Evaluations", icon: ClipboardCheck },
];

/**
 * Primary product navigation. Rendered three ways: expanded in the desktop
 * sidebar, as an icon rail when that sidebar is collapsed, and inside the
 * mobile drawer. The active state is deliberately a muted surface plus a thin
 * Electric Azure indicator — never amber (spec §36 reserves amber for CTAs and
 * AI affordances).
 */
export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-1")}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group focus-visible:ring-ring/40 relative flex h-10 shrink-0 items-center rounded-lg text-sm transition-colors outline-none focus-visible:ring-3",
              collapsed ? "w-10 justify-center px-0" : "gap-3 px-3",
              active
                ? "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium",
            )}
          >
            {active && (
              <span
                aria-hidden
                className={cn(
                  "absolute rounded-full bg-blue-600 dark:bg-blue-400",
                  collapsed
                    ? "inset-x-2 bottom-1 h-0.5"
                    : "top-1/2 left-0 h-5 w-0.5 -translate-y-1/2",
                )}
              />
            )}
            <Icon className="size-[18px] shrink-0" strokeWidth={2} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
