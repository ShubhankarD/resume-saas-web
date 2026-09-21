"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCuration, useCancelCuration } from "@/hooks/use-curations";
import { useJobProgress } from "@/hooks/use-job-progress";
import { curationStreamPath } from "@/lib/api/curations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { MetricCard } from "@/components/ui/metric-card";
import { ErrorMessage } from "@/components/content/error-message";
import { JobActivityFeed } from "@/components/jobs/job-activity-feed";

const NON_TERMINAL_STATUSES = new Set(["pending", "running"]);

/**
 * Curation job detail: shows the live agent activity feed while the job
 * runs, then a "Review draft" action once it lands on `draft_profile_id`.
 *
 * Only opens `GET /api/v1/curations/{id}/stream` for a job that is
 * non-terminal *when this page first sees it* (`hasStreamed`, a one-way
 * latch below) — reopening this page for a job that already finished
 * doesn't bother connecting to a channel the backend's
 * `subscribe_progress_events()` would have already closed from its side.
 * Deliberately does NOT re-derive "should I be streaming" from the
 * polled `status` on every render, though: `useCuration`'s poll can (and
 * in practice does, e.g. right after a fast failure) observe a terminal
 * status before the SSE connection has finished delivering/parsing every
 * event still in flight. Tying the stream's lifetime to that polled
 * status caused exactly that bug during manual verification — the feed's
 * own events got cleared out from under the user the instant the poll
 * saw `completed`, even though the activity that led there had just
 * streamed in. The latch keeps the stream (and its accumulated events)
 * open for the lifetime of this page once started; `useJobProgress`
 * itself is what actually closes the connection, on its own terminal SSE
 * event.
 */
export default function CurationDetailPage() {
  const params = useParams<{ id: string }>();
  const curationId = params.id;
  const { data: curation, isLoading, error } = useCuration(curationId);
  const cancelCuration = useCancelCuration(curationId);

  const isNonTerminal = curation ? NON_TERMINAL_STATUSES.has(curation.status) : false;

  const [hasStreamed, setHasStreamed] = useState(false);
  useEffect(() => {
    if (isNonTerminal) setHasStreamed(true);
  }, [isNonTerminal]);

  const { events, connectionState, connectionError } = useJobProgress(
    hasStreamed ? curationStreamPath(curationId) : undefined,
  );

  const canReview = curation?.status === "completed" && Boolean(curation.draft_profile_id);

  return (
    <div className="min-w-0 space-y-6">
      <PageToolbar
        className="-mx-4 -mt-5 w-auto px-4 md:-mx-6 md:-mt-6 md:px-6 lg:-mx-8 lg:px-8"
        left={
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/curations"
              aria-label="Back to curation jobs"
              className="focus-visible:ring-ring/50 -ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
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
              <Badge
                data-testid="curation-status-badge"
                variant={
                  curation.status === "completed"
                    ? "default"
                    : curation.status === "failed" || curation.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
              >
                {curation.status}
              </Badge>
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
