import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * A purposeful empty state: icon -> title -> short guidance -> one action.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center sm:px-8 dark:border-slate-800",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      ) : null}

      <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </p>

      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-balance text-slate-600 dark:text-slate-400">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
