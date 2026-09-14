"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCuration, useCancelCuration } from "@/hooks/use-curations";
import { useJobProgress } from "@/hooks/use-job-progress";
import { curationStreamPath } from "@/lib/api/curations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const router = useRouter();
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Curation job</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/curations")}>
          Back to list
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      <ErrorMessage error={error} />

      {curation && (
        <Card data-testid="curation-detail-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {curation.profile_name}
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
            </CardTitle>
            <CardDescription>
              min score {curation.min_score} · max turns {curation.max_turns}
              {curation.current_turn != null && ` · currently on turn ${curation.current_turn}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {curation.error_message && (
              <p role="alert" className="text-destructive text-sm" data-testid="curation-error-message">
                {curation.error_message}
              </p>
            )}
            {curation.gate_warning && (
              <p className="text-muted-foreground text-sm">{curation.gate_warning}</p>
            )}

            {isNonTerminal && (
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                disabled={cancelCuration.isPending}
                onClick={() => cancelCuration.mutate()}
                data-testid="cancel-curation-button"
              >
                {cancelCuration.isPending ? "Cancelling…" : "Cancel"}
              </Button>
            )}
            <ErrorMessage error={cancelCuration.error} />

            {canReview && (
              <Button
                nativeButton={false}
                render={<Link href={`/profiles/${curation.draft_profile_id}`} />}
                className="self-start"
                data-testid="review-draft-button"
              >
                Review draft
              </Button>
            )}
          </CardContent>
        </Card>
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
