"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import {
  useApplication,
  useCancelApplication,
  useConfirmSubmitApplication,
  useApplicationScreenshot,
} from "@/hooks/use-applications";
import { useJobProgress } from "@/hooks/use-job-progress";
import { applicationStreamPath, isCancellableApplicationStatus } from "@/lib/api/applications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { ErrorMessage } from "@/components/content/error-message";
import { JobActivityFeed } from "@/components/jobs/job-activity-feed";

function jobDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function statusVariant(status: string) {
  if (status === "submitted") return "default" as const;
  if (status === "failed" || status === "cancelled" || status === "expired") {
    return "destructive" as const;
  }
  return "secondary" as const;
}

/**
 * Apply job detail: the live browser session (once one exists) plus F6's
 * shared JobActivityFeed, then Cancel / Confirm-submit — the two actions
 * that are pure bookkeeping on the backend (see lib/api/applications.ts).
 * The agent never clicks Submit itself; the human does that for real,
 * inside the embedded session, and this page's Confirm-submit button is
 * just how that fact gets recorded afterward.
 *
 * `isCancellableApplicationStatus` doubles as "is this job non-terminal" —
 * the backend's own `_CANCELLABLE_STATUSES` tuple (queued/running/filling/
 * awaiting_review) *is* the non-terminal set by definition, so there is no
 * separate NON_TERMINAL_STATUSES here the way curation's detail page has
 * one; using the same predicate for both the stream latch and the Cancel
 * button's visibility keeps them from silently drifting apart.
 *
 * Same one-way `hasStreamed` latch as curation's detail page, and for the
 * identical documented reason: `useApplication`'s poll can observe a
 * terminal status before the SSE stream has finished delivering every
 * event still in flight, and tying the stream's lifetime to the polled
 * status instead of this latch reproduces that exact bug (see
 * curations/[id]/page.tsx's docstring for the full history).
 */
export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const { data: application, isLoading, error } = useApplication(applicationId);
  const cancelApplication = useCancelApplication(applicationId);
  const confirmSubmit = useConfirmSubmitApplication(applicationId);
  const screenshot = useApplicationScreenshot(applicationId);

  const isNonTerminal = application ? isCancellableApplicationStatus(application.status) : false;

  const [hasStreamed, setHasStreamed] = useState(false);
  useEffect(() => {
    if (isNonTerminal) setHasStreamed(true);
  }, [isNonTerminal]);

  const { events, connectionState, connectionError } = useJobProgress(
    hasStreamed ? applicationStreamPath(applicationId) : undefined,
  );

  // vnc_url/browser_session_id are written unconditionally once the
  // container launches and are never cleared afterward (see
  // lib/api/applications.ts) — so a session is worth *trying* to show
  // exactly while the job is still non-terminal, not merely while vnc_url
  // is present, or a terminal job whose container was already torn down
  // would show a dead iframe.
  const showLiveSession = isNonTerminal && Boolean(application?.vnc_url);
  const canConfirmSubmit = application?.status === "awaiting_review";
  const canCancel = isNonTerminal;

  return (
    <div className="min-w-0 space-y-4">
      <PageToolbar
        className="-mx-4 -mt-5 w-auto px-4 md:-mx-6 md:-mt-6 md:px-6 lg:-mx-8 lg:px-8"
        left={
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/applications"
              aria-label="Back to applications"
              className="focus-visible:ring-ring/50 -ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
            <div className="min-w-0">
              <p
                data-testid="application-job-domain"
                className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 sm:text-base dark:text-slate-50"
              >
                {application ? jobDomain(application.job_url) : "Application"}
              </p>
              {application ? (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 truncate text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                  <span className="truncate">View posting</span>
                </a>
              ) : null}
            </div>
          </div>
        }
        right={
          application ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge
                data-testid="application-status-badge"
                variant={statusVariant(application.status)}
              >
                {application.status}
              </Badge>
              {canCancel && (
                <Button
                  variant="outline"
                  disabled={cancelApplication.isPending}
                  onClick={() => cancelApplication.mutate()}
                  data-testid="cancel-application-button"
                >
                  {cancelApplication.isPending ? "Cancelling…" : "Cancel"}
                </Button>
              )}
              {canConfirmSubmit && (
                <Button
                  variant="cta"
                  disabled={confirmSubmit.isPending}
                  onClick={() => confirmSubmit.mutate()}
                  data-testid="confirm-submit-button"
                >
                  {confirmSubmit.isPending ? "Confirming…" : "I submitted it"}
                </Button>
              )}
            </div>
          ) : null
        }
      />

      <ErrorMessage error={error} />
      <ErrorMessage error={cancelApplication.error} />
      <ErrorMessage error={confirmSubmit.error} />

      {isLoading && (
        <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      )}

      {application && (
        <div data-testid="application-detail" className="space-y-4">
          {application.error_message && (
            <p
              role="alert"
              className="text-destructive border-destructive/30 bg-destructive/10 rounded-lg border px-3 py-2 text-sm"
              data-testid="application-error-message"
            >
              {application.error_message}
            </p>
          )}

          {canConfirmSubmit && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              The form is filled and ready. Review it in the session below, click the real Submit
              button yourself, then confirm here — the agent never submits on its own.
            </p>
          )}

          {showLiveSession ? (
            <LiveSession vncUrl={application.vnc_url as string} screenshot={screenshot} />
          ) : !isNonTerminal ? (
            <TerminalOutcome status={application.status} />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Preparing the browser session…
              </p>
              <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                This launches a real container — it usually takes a few seconds to become reachable.
              </p>
            </div>
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

function TerminalOutcome({ status }: { status: string }) {
  const copy: Record<string, string> = {
    submitted: "Submitted. The browser session has been closed.",
    cancelled: "Cancelled. The browser session has been closed.",
    failed: "The agent couldn't complete this application.",
    expired: "No one reviewed this session in time, so it was closed automatically.",
  };
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {copy[status] ?? `This application is ${status}.`}
      </p>
    </div>
  );
}

/**
 * The embedded session. `vnc_url` already carries its own per-session
 * auth token (F0-4, see plans/phase-F0-backend-prereqs.md) baked into the
 * noVNC path — this iframe needs no extra header/query wiring on top of
 * that URL.
 *
 * The container can legitimately take a few seconds to become reachable
 * after launch (the plan's own flagged risk), and a refused connection
 * doesn't reliably fire an iframe's `onError` in every browser — so the
 * fallback here is an always-visible "Trouble seeing the session?"
 * affordance, not something that only appears after a detected failure.
 */
function LiveSession({
  vncUrl,
  screenshot,
}: {
  vncUrl: string;
  screenshot: ReturnType<typeof useApplicationScreenshot>;
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
        <iframe
          title="Live browser session"
          src={vncUrl}
          data-testid="application-vnc-iframe"
          className="h-[70vh] w-full border-0 lg:h-[calc(100vh-16rem)]"
          allow="clipboard-read; clipboard-write"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="text-slate-500 dark:text-slate-400">
          Trouble seeing the session? It can take a few seconds to connect.
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => void screenshot.refresh()}
          disabled={screenshot.isLoading}
          data-testid="refresh-screenshot-button"
        >
          <RefreshCw aria-hidden="true" className={screenshot.isLoading ? "animate-spin" : ""} />
          {screenshot.isLoading ? "Loading…" : "View last frame instead"}
        </Button>
      </div>

      {screenshot.error ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No frame available yet — the session may still be starting.
        </p>
      ) : screenshot.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- a blob: object URL, not an optimizable remote asset.
        <img
          src={screenshot.url}
          alt="Last known frame of the browser session"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-800"
        />
      ) : null}
    </div>
  );
}
