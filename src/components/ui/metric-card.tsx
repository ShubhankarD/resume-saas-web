import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  /** One short supporting line, e.g. "4 sections ready". */
  hint?: string;
  /** 0–100. When set, renders a slim progress bar under the value. */
  progress?: number;
  icon?: LucideIcon;
  className?: string;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

/**
 * A compact workflow metric — label, value, optional progress and one hint.
 *
 * Deliberately small: metrics support the workflow rather than dominating it,
 * so this is a quiet bordered tile, not a giant dashboard statistic card.
 */
function MetricCard({
  label,
  value,
  hint,
  progress,
  icon: Icon,
  className,
}: MetricCardProps): React.ReactElement {
  const percent = progress === undefined ? undefined : clampPercent(progress);

  return (
    <div
      data-slot="metric-card"
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {Icon ? (
          <Icon aria-hidden="true" className="size-4 shrink-0 text-slate-400 dark:text-slate-500" />
        ) : null}
      </div>

      <p className="mt-1 text-2xl font-bold tracking-[-0.02em] text-slate-900 tabular-nums dark:text-slate-50">
        {value}
      </p>

      {percent !== undefined ? (
        <div
          role="progressbar"
          aria-label={label}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <div
            className="h-full rounded-full bg-slate-900 transition-[width] duration-300 ease-out dark:bg-slate-100"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}

      {hint ? (
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export { MetricCard };
export type { MetricCardProps };
