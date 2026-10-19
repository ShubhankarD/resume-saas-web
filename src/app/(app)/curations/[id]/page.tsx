"use client";

import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { useParams } from "next/navigation";
import { useCuration, useCancelCuration } from "@/hooks/use-curations";
import { useJobStream } from "@/hooks/use-job-stream";
import { curationStreamPath } from "@/lib/api/curations";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { isTerminalStatus } from "@/lib/domain/job-status";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { MetricCard } from "@/components/ui/metric-card";
import { ErrorMessage } from "@/components/content/error-message";
import { JobActivityFeed } from "@/components/jobs/job-activity-feed";

/**
 * Curation job detail: shows the live agent activity feed while the job
 * runs, then a "Review draft" action once it lands on `draft_profile_id`.
 *
 * The stream only opens for a job that is non-terminal *when this page first
 * sees it* and then stays open for the page's lifetime — see `useJobStream`
 * for why that latch is deliberately not derived from the polled status.
 */
export default function CurationDetailPage() {
  const params = useParams<{ id: string }>();
  const curationId = params.id;
  const { data: curation, isLoading, error } = useCuration(curationId);
  const cancelCuration = useCancelCuration(curationId);

  const isNonTerminal = curation ? !isTerminalStatus("job", curation.status) : false;

  const { events, connectionState, connectionError, hasStreamed } = useJobStream(
    isNonTerminal,
    curationStreamPath(curationId),
  );

  const canReview = curation?.status === "completed" && Boolean(curation.draft_profile_id);

  return (
    <div className="min-w-0 space-y-6">
      <PageToolbar
        className="-mx-4 -mt-5 w-auto px-4 md:-mx-6 md:-mt-6 md:px-6 lg:-mx-8 lg:px-8"
        left={
          <div className="flex min-w-0 items-center gap-2">
            <BackLink href="/curations" label="Back to curation jobs" className="-ml-1" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 sm:text-base dark:text-slate-50">
                {curation?.profile_name ?? "Curation job"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI curation</p>
            </div>
          </div>
        }
        right={
          curation ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <StatusBadge
                data-testid="curation-status-badge"
                kind="job"
                status={curation.status}
              />
              {isNonTerminal && (
                <Button
                  variant="outline"
                  disabled={cancelCuration.isPending}
                  onClick={() => cancelCuration.mutate()}
                  data-testid="cancel-curation-button"
                >
                  {cancelCuration.isPending ? "Cancelling…" : "Cancel"}
                </Button>
              )}
              {canReview && (
                <Button
                  nativeButton={false}
                  variant="cta"
                  render={<Link href={`/profiles/${curation.draft_profile_id}`} />}
                  data-testid="review-draft-button"
                >
                  Review draft
                </Button>
              )}
            </div>
          ) : null
        }
      />

      <ErrorMessage error={error} />
      <ErrorMessage error={cancelCuration.error} />

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      )}

      {curation && (
        <div data-testid="curation-detail-card" className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Minimum score" value={curation.min_score} />
            <MetricCard
              label="Turn"
              value={curation.current_turn != null ? curation.current_turn : "—"}
              hint={`of ${curation.max_turns} max`}
            />
            <MetricCard label="Status" value={curation.status} />
          </div>

          {curation.error_message && (
            <p
              role="alert"
              className="text-destructive border-destructive/30 bg-destructive/10 rounded-lg border px-3 py-2 text-sm"
              data-testid="curation-error-message"
            >
              {curation.error_message}
            </p>
          )}
          {curation.gate_warning && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {curation.gate_warning}
            </p>
          )}
        </div>
      )}

      {(hasStreamed || events.length > 0) && (
        <JobActivityFeed
          events={events}
          connectionState={connectionState}
          connectionError={connectionError}
        />
      )}
    </div>
  );
}
