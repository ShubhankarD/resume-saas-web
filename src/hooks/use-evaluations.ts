"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvaluation,
  deleteEvaluation,
  getEvaluation,
  listEvaluations,
  type EvaluationCreate,
} from "@/lib/api/evaluations";
import { queryKeys } from "@/lib/query-keys";

/** GET /api/v1/evaluations/ has no profile/JD filter server-side (flat,
 * tenant-scoped list) — mirrors use-builds.ts's useBuilds(). */
export function useEvaluations() {
  return useQuery({ queryKey: queryKeys.evaluations.all, queryFn: listEvaluations });
}

export function useEvaluation(evaluationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.evaluations.detail(evaluationId ?? ""),
    queryFn: () => getEvaluation(evaluationId as string),
    enabled: Boolean(evaluationId),
  });
}

/** POST /api/v1/evaluations/ is synchronous on the backend (see
 * lib/api/evaluations.ts) — this mutation's `data` on success is already
 * the finished (`completed` or `failed`) row, no polling needed. A `useMutation`
 * (not `useQuery`) is the right shape here: it's user-triggered, spends
 * real LLM tokens, and shouldn't refetch/retry on its own. */
export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: EvaluationCreate) => createEvaluation(body),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.evaluations.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.all });
    },
  });
}

export function useDeleteEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evaluationId: string) => deleteEvaluation(evaluationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.all });
    },
  });
}
