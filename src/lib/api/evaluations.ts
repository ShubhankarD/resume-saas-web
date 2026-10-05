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
  return apiFetch("/api/v1/evaluations/", { method: "get" });
}

export async function getEvaluation(evaluationId: string): Promise<EvaluationResponse> {
  return apiFetch("/api/v1/evaluations/{evaluation_id}", {
    params: { evaluation_id: evaluationId },
    method: "get",
  });
}

export async function createEvaluation(body: EvaluationCreate): Promise<EvaluationResponse> {
  return apiFetch("/api/v1/evaluations/", { method: "post", body });
}

export async function deleteEvaluation(evaluationId: string): Promise<void> {
  await apiFetch("/api/v1/evaluations/{evaluation_id}", {
    params: { evaluation_id: evaluationId },
    method: "delete",
  });
}
