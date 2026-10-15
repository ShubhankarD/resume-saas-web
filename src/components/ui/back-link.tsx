import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";

/** The icon-only "back to list" link at the start of a detail page's
 * toolbar. `label` is required — it's the link's only accessible name. */
export function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        className,
      )}
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
    </Link>
  );
}
