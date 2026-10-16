import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EvaluationSummary } from "@/lib/api/evaluations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivityRowSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 px-3 py-2.5">
      <div className="bg-muted h-4 w-2/5 animate-pulse rounded-md" />
      <div className="bg-muted ml-auto h-4 w-12 animate-pulse rounded-md" />
    </div>
  );
}

interface RecentEvaluationsProps {
  evaluations: readonly EvaluationSummary[];
  isLoading: boolean;
  /** Shown when there is nothing to list. */
  emptyHint: string;
  profileLabel: (profileId: string) => string;
  jdTitle: (jdId: string) => string;
}

export function RecentEvaluations({
  evaluations,
  isLoading,
  emptyHint,
  profileLabel,
  jdTitle,
}: RecentEvaluationsProps) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Recent evaluations"
        description="The latest runs, newest first."
        action={
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/evaluations" />}
          >
            View all
            <ArrowRight aria-hidden="true" />
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <CardContent className="px-0">
          {isLoading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <ActivityRowSkeleton />
              <ActivityRowSkeleton />
              <ActivityRowSkeleton />
            </div>
          ) : evaluations.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
              Nothing scored yet. {emptyHint}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {evaluations.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/evaluations/${e.id}`}
                    className="focus-visible:ring-ring/40 flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 outline-none hover:bg-slate-50 focus-visible:ring-3 dark:hover:bg-slate-800/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {profileLabel(e.profile_id)}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        vs. {jdTitle(e.jd_id)} · {formatDate(e.created_at)}
                      </span>
                    </span>
                    {e.status !== "completed" ? <StatusBadge kind="job" status={e.status} /> : null}
                    <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                      {e.overall_score != null ? `${e.overall_score}/10` : "—"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
