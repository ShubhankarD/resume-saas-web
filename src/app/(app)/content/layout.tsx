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
import { cn } from "cn";

const TABS: readonly { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/content", label: "Overview", icon: LayoutGrid },
  { href: "/content/experience", label: "Experience", icon: Briefcase },
  { href: "/content/taglines", label: "Taglines", icon: Quote },
  { href: "/content/skills", label: "Skills", icon: Wrench },
  { href: "/content/education", label: "Education", icon: GraduationCap },
  { href: "/content/import", label: "Import / Export", icon: Repeat2 },
  { href: "/content/intake", label: "Upload resume", icon: FileUp },
];

/**
 * Content-library chrome: a compact 44px tab strip over the sub-sections.
 *
 * These are real navigations, so the strip is a list of `<Link>`s rather than
 * `CompactTabs` (which is a controlled, button-based switch) — but it matches
 * that component's dimensions and selected-state treatment: underline
 * indicator plus stronger text, never a pill.
 */
export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6">
      <nav aria-label="Content sections">
        <ul className="flex h-11 w-full min-w-0 [scrollbar-width:none] items-stretch gap-1 overflow-x-auto border-b border-slate-200 [-ms-overflow-style:none] sm:gap-2 dark:border-slate-800 [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active =
              tab.href === "/content" ? pathname === "/content" : pathname?.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <li key={tab.href} className="flex">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/50 -mb-px inline-flex shrink-0 items-center gap-1.5 rounded-t-md border-b-2 px-3 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-3",
                    active
                      ? "border-slate-900 font-semibold text-slate-900 dark:border-slate-100 dark:text-slate-100"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {tab.label}
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
