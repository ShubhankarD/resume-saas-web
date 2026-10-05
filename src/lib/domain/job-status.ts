/**
 * The status vocabularies of the backend's job tables, and everything the
 * UI derives from a status (terminal or not, cancellable or not, badge
 * tone) — as lookup tables instead of `if (status === …)` chains repeated
 * per page. Adding a status means adding one row here; `satisfies Record<…>`
 * makes a missing row a compile error.
 *
 * The schema types every `status` as plain `string`, so lookups accept any
 * string; an unrecognized value is treated as terminal (stop polling, no
 * Cancel button) with a neutral badge.
 */

export type StatusTone = "default" | "secondary" | "destructive";

export interface StatusMeta {
  /** No further transitions — polling and streaming can stop. */
  terminal: boolean;
  /** The backend accepts a cancel request in this status. */
  cancellable: boolean;
  tone: StatusTone;
}

/** JobStatusMixin's JOB_STATUSES (app/models/mixins.py) — builds,
 * evaluations and curations. */
export const JOB_STATUSES = ["pending", "running", "completed", "failed", "cancelled"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** APPLICATION_JOB_STATUSES (app/models/application_job.py) — apply jobs
 * have their own vocabulary, with a human-in-the-loop `awaiting_review`. */
export const APPLICATION_STATUSES = [
  "queued",
  "running",
  "filling",
  "awaiting_review",
  "submitted",
  "failed",
  "cancelled",
  "expired",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

const active: StatusMeta = { terminal: false, cancellable: true, tone: "secondary" };
const succeeded: StatusMeta = { terminal: true, cancellable: false, tone: "default" };
const ended: StatusMeta = { terminal: true, cancellable: false, tone: "destructive" };
const unknown: StatusMeta = { terminal: true, cancellable: false, tone: "secondary" };

const JOB_STATUS_META = {
  pending: active,
  running: active,
  completed: succeeded,
  failed: ended,
  cancelled: ended,
} satisfies Record<JobStatus, StatusMeta>;

/** Cancellable set mirrors application_service.py's `_CANCELLABLE_STATUSES`
 * exactly — which is also, by definition, the non-terminal set. */
const APPLICATION_STATUS_META = {
  queued: active,
  running: active,
  filling: active,
  awaiting_review: active,
  submitted: succeeded,
  failed: ended,
  cancelled: ended,
  expired: ended,
} satisfies Record<ApplicationStatus, StatusMeta>;

export type StatusKind = "job" | "application";

const META_BY_KIND: Record<StatusKind, Record<string, StatusMeta>> = {
  job: JOB_STATUS_META,
  application: APPLICATION_STATUS_META,
};

export function statusMeta(kind: StatusKind, status: string): StatusMeta {
  return Object.hasOwn(META_BY_KIND[kind], status) ? META_BY_KIND[kind][status] : unknown;
}

export function isTerminalStatus(kind: StatusKind, status: string): boolean {
  return statusMeta(kind, status).terminal;
}

export function isCancellableStatus(kind: StatusKind, status: string): boolean {
  return statusMeta(kind, status).cancellable;
}
