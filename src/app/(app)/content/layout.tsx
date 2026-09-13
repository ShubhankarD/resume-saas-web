"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/content", label: "Overview" },
  { href: "/content/experience", label: "Experience" },
  { href: "/content/taglines", label: "Taglines" },
  { href: "/content/skills", label: "Skills" },
  { href: "/content/education", label: "Education" },
  { href: "/content/import", label: "Import / Export" },
  { href: "/content/intake", label: "Upload resume" },
] as const;

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <nav
        className="border-border flex flex-wrap gap-1 border-b pb-2"
        aria-label="Content sections"
      >
        {TABS.map((tab) => {
          const active =
            tab.href === "/content" ? pathname === "/content" : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
