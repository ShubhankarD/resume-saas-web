import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

/** A single compact destination row — an actionable row that can carry a live count. */
export function WorkflowRow({
  href,
  title,
  description,
  icon: Icon,
  meta,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring/40 group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-[border-color,box-shadow,transform] duration-150 ease-out outline-none hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_1px_3px_rgba(15,23,42,0.08)] focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
      {meta ? (
        <span className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {meta}
        </span>
      ) : null}
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
