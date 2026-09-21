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
 * mobile drawer.
 *
 * Row geometry follows spec §7 / §39: 40px tall, 12px horizontal padding,
 * 8px radius, 16–18px icon, 14px medium text. The selected row is a solid
 * ink surface rather than a muted tint plus indicator — §7 asks for a
 * restrained but unmistakable active state, and explicitly rules out putting
 * an outline around every row. Selection is never signalled by colour alone:
 * the active row also carries `aria-current="page"` and a heavier weight.
 * Only five destinations exist, so the optional OVERVIEW/CONTENT/TOOLS group
 * labels from §7 are skipped — at this length they are pure noise.
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
    <nav aria-label="Main" className="flex flex-col gap-1">
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
              "focus-visible:ring-ring/40 flex h-10 shrink-0 items-center rounded-md text-sm transition-colors outline-none focus-visible:ring-2",
              collapsed ? "w-10 justify-center px-0" : "gap-3 px-3",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium",
            )}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={2} aria-hidden />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
