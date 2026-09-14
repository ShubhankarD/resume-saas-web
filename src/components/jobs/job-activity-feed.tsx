import type {
  JobProgressConnectionState,
  JobProgressEvent,
} from "@/hooks/use-job-progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <CardTitle className="flex items-center justify-between gap-2">
          <span>Agent activity</span>
          <ConnectionBadge state={connectionState} />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {connectionError && (
          <p role="alert" className="text-destructive text-sm">
            {connectionError}
          </p>
        )}

        {latestScore && latestScore.type === "score" && (
          <div
            data-testid="job-activity-score"
            className="border-border bg-muted/40 flex items-center gap-4 rounded-lg border px-3 py-2 text-sm"
          >
            <span>
              Overall score: <strong>{latestScore.overall_score}</strong>
            </span>
            <span>
              Coverage: <strong>{latestScore.coverage_score}</strong>
            </span>
          </div>
        )}

        {events.length === 0 && connectionState !== "error" && (
          <p className="text-muted-foreground text-sm">Waiting for the agent to start…</p>
        )}

        <ol className="flex flex-col gap-2" data-testid="job-activity-events">
          {events.map((event, i) => (
            <li key={i} data-testid={`job-activity-event-${event.type}`}>
              <JobActivityEventRow event={event} />
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function JobActivityEventRow({ event }: { event: JobProgressEvent }) {
  switch (event.type) {
    case "tool_call":
      return (
        <div className="border-border flex items-start gap-2 rounded-lg border px-3 py-2 text-sm">
          <Badge variant="outline">turn {event.turn}</Badge>
          <div className="flex flex-col">
            <span className="font-medium">{event.name}</span>
            <span className="text-muted-foreground text-xs break-all">{event.args_summary}</span>
          </div>
        </div>
      );
    case "score":
      return (
        <div className="border-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Badge variant="secondary">score</Badge>
          <span>
            overall {event.overall_score} · coverage {event.coverage_score}
          </span>
        </div>
      );
    case "completed":
      return (
        <div className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Badge>completed</Badge>
          <span>Draft is ready to review.</span>
        </div>
      );
    case "awaiting_review":
      return (
        <div className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Badge>awaiting review</Badge>
          <span>{event.summary ?? "Ready for review."}</span>
        </div>
      );
    case "failed":
      return (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Badge variant="destructive">failed</Badge>
          <span>{event.error}</span>
        </div>
      );
    case "cancelled":
      return (
        <div className="border-border bg-muted/40 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Badge variant="secondary">cancelled</Badge>
          <span>The job was cancelled.</span>
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
