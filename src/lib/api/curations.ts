import { apiFetch, buildPath } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the AI curation surface (`app/api/curations.py` in
 * the backend). Unlike evaluations (synchronous end-to-end), curation is
 * job-shaped like builds: `POST /api/v1/curations/` enqueues an arq task
 * (`curate_task`, `app/workers/curate_worker.py`) and returns immediately
 * with `status: "pending"` — progress is only observable via the SSE
 * stream at `GET /api/v1/curations/{id}/stream` (see use-job-progress.ts),
 * and the finished row is polled/refetched via `GET /api/v1/curations/{id}`.
 *
 * `CurationResponse.draft_profile_id` is only populated once the backend
 * sets `status: "completed"` — `curate_task` creates the draft `Profile`
 * row and assigns `job.draft_profile_id = profile.id` in the same
 * transaction that flips status to `"completed"` (see curate_worker.py),
 * so a non-null `draft_profile_id` and `status === "completed"` are
 * effectively the same fact. There is currently no code path in
 * `curate_task` that ever publishes/sets `awaiting_review` — that terminal
 * state exists in the shared vocabulary for Apply (F7) to use, not
 * curation today; a curation job either completes with a draft profile or
 * fails.
 */
export type CurationSummary = components["schemas"]["CurationSummary"];
export type CurationResponse = components["schemas"]["CurationResponse"];
export type CurationCreate = components["schemas"]["CurationCreate"];

export async function listCurations(): Promise<CurationSummary[]> {
  return apiFetch("/api/v1/curations/", { method: "get" });
}

export async function getCuration(curationId: string): Promise<CurationResponse> {
  return apiFetch("/api/v1/curations/{curation_id}", {
    params: { curation_id: curationId },
    method: "get",
  });
}

export async function createCuration(body: CurationCreate): Promise<CurationResponse> {
  return apiFetch("/api/v1/curations/", { method: "post", body });
}

export async function deleteCuration(curationId: string): Promise<void> {
  await apiFetch("/api/v1/curations/{curation_id}", {
    params: { curation_id: curationId },
    method: "delete",
  });
}

export async function cancelCuration(curationId: string): Promise<CurationResponse> {
  return apiFetch("/api/v1/curations/{curation_id}/cancel", {
    params: { curation_id: curationId },
    method: "post",
  });
}

/** Path (not full URL) for a curation job's SSE stream — passed to
 * useJobProgress(), which resolves it against the same API base URL and
 * auth header apiFetch/authFetch use (see that hook's docstring for why a
 * plain `EventSource` can't be used here: the endpoint is Bearer-authed
 * and `EventSource` can't set request headers). */
export function curationStreamPath(curationId: string): string {
  return buildPath("/api/v1/curations/{curation_id}/stream", { curation_id: curationId });
}
