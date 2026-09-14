import { apiFetch } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the evaluation-trigger surface
 * (`app/api/evaluations.py` in the backend). Unlike builds/curations,
 * `POST /api/v1/evaluations/` is synchronous end-to-end on the backend —
 * it runs deterministic metrics + the LLM judge inline inside the request
 * handler and returns the finished `EvaluationResponse` directly (status
 * already `completed` or `failed`, per `tracked_job()`'s "exception is
 * swallowed and recorded, not re-raised as an HTTP error" behavior for
 * anything past profile/JD validation) — so there's no job-polling hook
 * here, just a plain mutation.
 */
export type EvaluationSummary = components["schemas"]["EvaluationSummary"];
export type EvaluationResponse = components["schemas"]["EvaluationResponse"];
export type EvaluationCreate = components["schemas"]["EvaluationCreate"];

export async function listEvaluations(): Promise<EvaluationSummary[]> {
  const data = await apiFetch("/api/v1/evaluations/", { method: "get" });
  return data as unknown as EvaluationSummary[];
}

export async function getEvaluation(evaluationId: string): Promise<EvaluationResponse> {
  const data = await apiFetch(
    `/api/v1/evaluations/${encodeURIComponent(evaluationId)}` as "/api/v1/evaluations/{evaluation_id}",
    { method: "get" },
  );
  return data as unknown as EvaluationResponse;
}

export async function createEvaluation(body: EvaluationCreate): Promise<EvaluationResponse> {
  const data = await apiFetch("/api/v1/evaluations/", { method: "post", body });
  return data as unknown as EvaluationResponse;
}

export async function deleteEvaluation(evaluationId: string): Promise<void> {
  await apiFetch(
    `/api/v1/evaluations/${encodeURIComponent(evaluationId)}` as "/api/v1/evaluations/{evaluation_id}",
    { method: "delete" },
  );
}
