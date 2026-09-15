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
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center sm:px-6 dark:border-slate-800",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Icon aria-hidden="true" className="size-4" />
        </div>
      ) : null}

      <p className="text-sm font-semibold tracking-[-0.01em] text-slate-900 sm:text-base dark:text-slate-100">
        {title}
      </p>

      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-balance text-slate-600 dark:text-slate-400">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
