import Link from "next/link";
import { ChevronRight, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** How many rows each overview section previews before linking to its editor. */
export const PREVIEW_ROWS = 3;

const ROW_LINK_CLASS =
  "focus-visible:ring-ring/50 flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors duration-150 outline-none hover:border-slate-300 focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700";

export function RowChevron() {
  return (
    <ChevronRight
      aria-hidden="true"
      className="size-4 shrink-0 text-slate-400 dark:text-slate-500"
    />
  );
}

export function SectionOverline({ label }: { label: string }) {
  return (
    <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
      {label}
    </h2>
  );
}

/** Icon tile + title + one-line description, the shared body of the start rows. */
export function IconRowBody({
  icon: Icon,
  tone = "neutral",
  title,
  description,
}: {
  icon: LucideIcon;
  tone?: "neutral" | "accent";
  title: string;
  description: string;
}) {
  const toneClass =
    tone === "accent"
      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  return (
    <>
      <span
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-md ${toneClass}`}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
      <RowChevron />
    </>
  );
}

export function StartOptionRow({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className={ROW_LINK_CLASS}>
      <IconRowBody icon={icon} title={title} description={description} />
    </Link>
  );
}

export function OverviewRow({ href, title, meta }: { href: string; title: string; meta?: string }) {
  return (
    <Link href={href} className={`${ROW_LINK_CLASS} min-h-16`}>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </span>
        {meta ? (
          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
            {meta}
          </span>
        ) : null}
      </span>
      <RowChevron />
    </Link>
  );
}

export function OverviewSection({
  label,
  href,
  addLabel,
  total,
  emptyLabel,
  children,
}: {
  label: string;
  href: string;
  addLabel: string;
  total: number;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SectionOverline label={label} />
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link href={href} />}
          aria-label={`${addLabel} — ${label}`}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          {addLabel}
        </Button>
      </div>

      {total === 0 ? (
        <Link
          href={href}
          className="focus-visible:ring-ring/50 flex min-h-16 items-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 transition-colors duration-150 outline-none hover:border-slate-300 hover:text-slate-900 focus-visible:ring-3 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-100"
        >
          <Plus aria-hidden="true" className="size-4 shrink-0" />
          {emptyLabel}
        </Link>
      ) : (
        <div className="space-y-2">
          {children}
          {total > PREVIEW_ROWS && (
            <Link
              href={href}
              className="focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-600 transition-colors duration-150 outline-none hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:text-slate-100"
            >
              View all {total}
              <ChevronRight aria-hidden="true" className="size-3.5" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
