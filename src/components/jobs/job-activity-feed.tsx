import type { JobProgressConnectionState, JobProgressEvent } from "@/hooks/use-job-progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Shared live-activity renderer for any job that publishes the backend's
 * SSE progress vocabulary (`app/services/progress_publisher.py`) — first
 * built here for curation (F6), reused as-is by apply (F7) per
 * `plans/README.md`'s real-time architecture decision. Deliberately takes
 * plain `events`/`connectionState` props rather than a `streamPath`, so it
 * has no idea which job kind or hook instance produced them — a page wires
 * it to `useJobProgress(streamPath)` itself (see
 * app/(app)/curations/[id]/page.tsx), keeping this component reusable for
 * whatever F7 wires it to next.
 */
export function JobActivityFeed({
  events,
  connectionState,
  connectionError,
}: {
  events: JobProgressEvent[];
  connectionState: JobProgressConnectionState;
  connectionError: string | null;
}) {
  const latestScore = [...events].reverse().find((e) => e.type === "score");

  return (
    <Card data-testid="job-activity-feed">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Agent activity
          </h2>
          <ConnectionBadge state={connectionState} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionError && (
          <p
            role="alert"
            className="text-destructive border-destructive/30 bg-destructive/10 rounded-lg border px-3 py-2 text-sm"
          >
            {connectionError}
          </p>
        )}

        {latestScore && latestScore.type === "score" && (
          <div
            data-testid="job-activity-score"
            className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950"
          >
            <ScoreStat label="Overall" value={latestScore.overall_score} />
            <ScoreStat label="Coverage" value={latestScore.coverage_score} />
          </div>
        )}

        {events.length === 0 && connectionState !== "error" && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Waiting for the agent to start…
          </p>
        )}

        {/* A divided list rather than a stack of bordered boxes — §15 and
            §23: one border level, whitespace does the rest of the work. */}
        <ol
          className="divide-y divide-slate-200 dark:divide-slate-800"
          data-testid="job-activity-events"
        >
          {events.map((event, i) => (
            <li
              key={i}
              className="py-2.5 first:pt-0 last:pb-0"
              data-testid={`job-activity-event-${event.type}`}
            >
              <JobActivityEventRow event={event} />
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function ScoreStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-base font-bold text-slate-900 tabular-nums dark:text-slate-50">
        {value}
      </span>
    </span>
  );
}

function JobActivityEventRow({ event }: { event: JobProgressEvent }) {
  switch (event.type) {
    case "tool_call":
      return (
        <div className="flex items-start gap-2.5">
          <Badge variant="outline" className="mt-0.5 shrink-0 tabular-nums">
            turn {event.turn}
          </Badge>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.name}</p>
            <p className="text-xs break-all text-slate-500 dark:text-slate-400">
              {event.args_summary}
            </p>
          </div>
        </div>
      );
    case "score":
      return (
        <div className="flex items-center gap-2.5">
          <Badge variant="secondary" className="shrink-0">
            score
          </Badge>
          <span className="text-sm text-slate-600 tabular-nums dark:text-slate-400">
            overall {event.overall_score} · coverage {event.coverage_score}
          </span>
        </div>
      );
    case "completed":
      return (
        <div className="flex items-center gap-2.5">
          <Badge className="shrink-0">completed</Badge>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Draft is ready to review.
          </span>
        </div>
      );
    case "awaiting_review":
      return (
        <div className="flex items-center gap-2.5">
          <Badge className="shrink-0">awaiting review</Badge>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {event.summary ?? "Ready for review."}
          </span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-2.5">
          <Badge variant="destructive" className="shrink-0">
            failed
          </Badge>
          <span className="text-destructive text-sm">{event.error}</span>
        </div>
      );
    case "cancelled":
      return (
        <div className="flex items-center gap-2.5">
          <Badge variant="secondary" className="shrink-0">
            cancelled
          </Badge>
          <span className="text-sm text-slate-600 dark:text-slate-400">The job was cancelled.</span>
        </div>
      );
  }
}

function ConnectionBadge({ state }: { state: JobProgressConnectionState }) {
  switch (state) {
    case "idle":
      return null;
    case "connecting":
      return <Badge variant="secondary">connecting…</Badge>;
    case "streaming":
      return <Badge variant="default">live</Badge>;
    case "closed":
      return <Badge variant="outline">stream closed</Badge>;
    case "error":
      return <Badge variant="destructive">connection error</Badge>;
  }
}
