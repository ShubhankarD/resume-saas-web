"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileUp,
  GraduationCap,
  LayoutGrid,
  Quote,
  Repeat2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: readonly { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/content", label: "Overview", icon: LayoutGrid },
  { href: "/content/experience", label: "Experience", icon: Briefcase },
  { href: "/content/taglines", label: "Taglines", icon: Quote },
  { href: "/content/skills", label: "Skills", icon: Wrench },
  { href: "/content/education", label: "Education", icon: GraduationCap },
  { href: "/content/import", label: "Import / Export", icon: Repeat2 },
  { href: "/content/intake", label: "Upload resume", icon: FileUp },
];

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <nav aria-label="Content sections">
        <ul className="flex flex-wrap gap-1.5">
          {TABS.map((tab) => {
            const active =
              tab.href === "/content" ? pathname === "/content" : pathname?.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/50 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-3",
                    active
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-50 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {children}
    </div>
  );
}
