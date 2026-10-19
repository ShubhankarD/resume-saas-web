import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EvaluationRow } from "@/lib/domain/evaluation-list";
import { formatDate } from "@/lib/domain/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export function EvaluationCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-3">
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/3 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-20 animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}

export function EvaluationCard({ evaluation: e }: { evaluation: EvaluationRow }) {
  return (
    <Card data-testid={`evaluation-card-${e.id}`} interactive className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
              {e.profileLabel}
            </h2>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">vs. {e.jdTitle}</p>
          </div>
          <p className="shrink-0 text-lg font-semibold text-slate-900 tabular-nums dark:text-slate-50">
            {e.overall_score != null ? (
              <>
                {e.overall_score}
                <span className="text-xs font-medium text-slate-400">/10</span>
              </>
            ) : (
              "—"
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge kind="job" status={e.status} />
          {e.coverage_score != null ? (
            <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
              Coverage {e.coverage_score}/10
            </span>
          ) : null}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(e.created_at, { withYear: true })}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-end">
          <Button
            nativeButton={false}
            render={<Link href={`/evaluations/${e.id}`} />}
            size="sm"
            variant="outline"
          >
            View
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
