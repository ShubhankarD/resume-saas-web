"use client";

import { BackLink } from "@/components/ui/back-link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import {
  useApplication,
  useCancelApplication,
  useConfirmSubmitApplication,
  useApplicationScreenshot,
} from "@/hooks/use-applications";
import { useJobStream } from "@/hooks/use-job-stream";
import { applicationStreamPath } from "@/lib/api/applications";
import { jobDomain } from "@/lib/domain/application";
import { isTerminalStatus } from "@/lib/domain/job-status";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { ErrorMessage } from "@/components/content/error-message";
import { JobActivityFeed } from "@/components/jobs/job-activity-feed";
import {
  LiveSession,
  PreparingSession,
  TerminalOutcome,
} from "@/components/applications/application-session";

/**
 * Apply job detail: the live browser session (once one exists) plus F6's
 * shared JobActivityFeed, then Cancel / Confirm-submit — the two actions
 * that are pure bookkeeping on the backend (see lib/api/applications.ts).
 * The agent never clicks Submit itself; the human does that for real,
 * inside the embedded session, and this page's Confirm-submit button is
 * just how that fact gets recorded afterward.
 *
 * Terminal/cancellable both come from the shared status table
 * (lib/domain/job-status.ts), where an application's cancellable set is by
 * definition its non-terminal set — so the stream latch and the Cancel
 * button's visibility can't silently drift apart.
 *
 * The stream lifecycle (one-way latch, see `useJobStream`) is shared with the
 * curation detail page.
 */
export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const { data: application, isLoading, error } = useApplication(applicationId);
  const cancelApplication = useCancelApplication(applicationId);
  const confirmSubmit = useConfirmSubmitApplication(applicationId);
  const screenshot = useApplicationScreenshot(applicationId);

  const isNonTerminal = application ? !isTerminalStatus("application", application.status) : false;

  const { events, connectionState, connectionError, hasStreamed } = useJobStream(
    isNonTerminal,
    applicationStreamPath(applicationId),
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
            <BackLink href="/applications" label="Back to applications" className="-ml-1" />
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
              <StatusBadge
                data-testid="application-status-badge"
                kind="application"
                status={application.status}
              />
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
            <PreparingSession />
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
