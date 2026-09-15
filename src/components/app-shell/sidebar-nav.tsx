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

export function SidebarNav({
  orientation = "vertical",
  collapsed = false,
}: {
  orientation?: "vertical" | "horizontal";
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "vertical" ? "flex-col px-3" : "w-max flex-row",
      )}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={2} />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
