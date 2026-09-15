import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Primary action; right-aligned from the `sm` breakpoint up. */
  action?: React.ReactNode;
  /** When set, renders a back link to the left of the title. */
  backHref?: string;
  /** Optional extra row rendered below the header block. */
  children?: React.ReactNode;
  className?: string;
  /**
   * Puts a `data-testid` on the `<h1>` itself rather than on a wrapper, so
   * exact-text assertions keep matching the title alone (the eyebrow and
   * description would otherwise be part of a wrapper's text content).
   */
  titleTestId?: string;
};

/**
 * The standard page header: eyebrow -> title -> description -> primary action.
 */
function PageHeader({
  eyebrow,
  title,
  description,
  action,
  backHref,
  children,
  className,
  titleTestId,
}: PageHeaderProps): React.ReactElement {
  return (
    <div data-slot="page-header" className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Go back"
              className="focus-visible:ring-ring/50 mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
          ) : null}

          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {eyebrow}
              </p>
            ) : null}

            <h1
              data-testid={titleTestId}
              className="text-2xl font-bold tracking-tight text-balance text-slate-900 sm:text-3xl dark:text-slate-50"
            >
              {title}
            </h1>

            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{action}</div>
        ) : null}
      </div>

      {children}
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * A lighter heading used inside cards and page sections.
 */
function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps): React.ReactElement {
  return (
    <div
      data-slot="section-header"
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{action}</div>
      ) : null}
    </div>
  );
}

export { PageHeader, SectionHeader };
