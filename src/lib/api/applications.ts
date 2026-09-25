import { apiFetch, authFetch } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the Apply surface (`app/api/applications.py` in the
 * backend, Phase 8). Structurally identical to curations.ts — `POST
 * /api/v1/applications/` enqueues an arq task (`apply_task`,
 * app/workers/apply_worker.py) and returns immediately, progress is only
 * observable via the SSE stream (see use-job-progress.ts, which this reuses
 * verbatim — it was built job-agnostic in F6 specifically so F7 could) —
 * but the STATUS VOCABULARY is different and more granular than curation's
 * pending/running/completed/failed/cancelled. Read app/workers/apply_worker.py,
 * app/services/application_service.py, and app/workers/apply_cleanup.py in
 * full before changing any status-based UI logic here:
 *
 *   queued -> running -> filling -> awaiting_review -> submitted
 *                                                     -> cancelled
 *                                                     (or -> failed / -> expired
 *                                                      from almost any point)
 *
 * - `browser_session_id`/`vnc_url` are written unconditionally by
 *   `apply_task` once the container launches — they exist from status
 *   "filling" onward, for the lifetime of the container. `apply_runner`
 *   (inside the container) may race ahead of that same commit and advance
 *   status further (even to a terminal one) before this write lands, but
 *   the columns still land either way (see apply_worker.py's #149 comment) —
 *   so "does a session exist" is `vnc_url != null`, not a status comparison.
 * - The container is torn down (`BrowserSessionService.destroy_session`) the
 *   moment a job reaches any terminal status — `submitted` (confirm-submit),
 *   `cancelled` (cancel, at any non-terminal stage), `failed`, or `expired`
 *   (apply_cleanup.py's 30-minute stale-review sweep). `vnc_url` is not
 *   nulled out afterward (same "keep the historical record" convention as
 *   `data_dir`), so the frontend must stop rendering the iframe once
 *   terminal, not rely on the field disappearing.
 * - `confirm_submit_application` only acts when status === "awaiting_review"
 *   (a no-op otherwise); `cancel_application` acts from queued/running/
 *   filling/awaiting_review (`_CANCELLABLE_STATUSES` in that file, mirrored
 *   as CANCELLABLE_APPLICATION_STATUSES below) and is a no-op from any
 *   terminal status. Both are pure bookkeeping plus container teardown —
 *   neither ever clicks anything inside the browser session; the human
 *   clicks the real Submit button themselves (see CLAUDE.md).
 * - apply_runner's SyncProgressPublisher only ever emits `tool_call`,
 *   `awaiting_review`, `failed`, `cancelled` (app/apply_runner/progress.py) —
 *   never `score` or `completed` (those are curation-only in practice, even
 *   though the SSE event union is shared). JobActivityFeed already renders
 *   the score banner conditionally, so this needs no special-casing there.
 */
export type ApplicationSummary = components["schemas"]["ApplicationSummary"];
export type ApplicationResponse = components["schemas"]["ApplicationResponse"];
export type ApplicationCreate = components["schemas"]["ApplicationCreate"];

/** Mirrors app/services/application_service.py's `_CANCELLABLE_STATUSES`
 * exactly — keep in sync by hand if that tuple ever changes, same
 * discipline apply_runner/progress.py's own docstring asks of itself. */
export const CANCELLABLE_APPLICATION_STATUSES = [
  "queued",
  "running",
  "filling",
  "awaiting_review",
] as const;

export function isCancellableApplicationStatus(status: string): boolean {
  return (CANCELLABLE_APPLICATION_STATUSES as readonly string[]).includes(status);
}

export async function listApplications(): Promise<ApplicationSummary[]> {
  const data = await apiFetch("/api/v1/applications/", { method: "get" });
  return data as unknown as ApplicationSummary[];
}

export async function getApplication(applicationId: string): Promise<ApplicationResponse> {
  const data = await apiFetch(
    `/api/v1/applications/${encodeURIComponent(applicationId)}` as "/api/v1/applications/{application_id}",
    { method: "get" },
  );
  return data as unknown as ApplicationResponse;
}

export async function createApplication(body: ApplicationCreate): Promise<ApplicationResponse> {
  const data = await apiFetch("/api/v1/applications/", { method: "post", body });
  return data as unknown as ApplicationResponse;
}

export async function deleteApplication(applicationId: string): Promise<void> {
  await apiFetch(
    `/api/v1/applications/${encodeURIComponent(applicationId)}` as "/api/v1/applications/{application_id}",
    { method: "delete" },
  );
}

export async function cancelApplication(applicationId: string): Promise<ApplicationResponse> {
  const data = await apiFetch(
    `/api/v1/applications/${encodeURIComponent(applicationId)}/cancel` as "/api/v1/applications/{application_id}/cancel",
    { method: "post" },
  );
  return data as unknown as ApplicationResponse;
}

export async function confirmSubmitApplication(
  applicationId: string,
): Promise<ApplicationResponse> {
  const data = await apiFetch(
    `/api/v1/applications/${encodeURIComponent(applicationId)}/confirm-submit` as "/api/v1/applications/{application_id}/confirm-submit",
    { method: "post" },
  );
  return data as unknown as ApplicationResponse;
}

/** Path (not full URL) for an application job's SSE stream — passed to
 * useJobProgress(), same pattern as curationStreamPath. */
export function applicationStreamPath(applicationId: string): string {
  return `/api/v1/applications/${encodeURIComponent(applicationId)}/stream`;
}

/**
 * `GET /api/v1/applications/{id}/screenshot` returns raw `image/png` bytes
 * (app/api/applications.py returns a plain `Response`, not a JSON body —
 * openapi-typescript's "application/json" typing for it is a generated
 * fallback, not the real content type; confirmed by reading the route, not
 * assumed), Bearer-authed like every other endpoint. `apiFetch` always
 * parses the body as JSON/text, so it can't be used here; this goes through
 * `authFetch` directly for the same Bearer header + refresh-retry handling,
 * then hands back an object URL the caller must revoke when done with it
 * (`URL.revokeObjectURL`) — see use-applications.ts's
 * `useApplicationScreenshot` for the hook that manages that lifetime.
 *
 * Raises (via authFetch's normal non-ok response) if the screenshot doesn't
 * exist yet — `get_latest_screenshot_path` 404s until `apply_runner` has
 * written at least one frame, which callers should treat as "not available
 * yet", not a hard error.
 */
export async function fetchApplicationScreenshotUrl(applicationId: string): Promise<string> {
  const response = await authFetch(
    `/api/v1/applications/${encodeURIComponent(applicationId)}/screenshot`,
  );
  if (!response.ok) {
    throw new Error(`screenshot request failed with status ${response.status}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
