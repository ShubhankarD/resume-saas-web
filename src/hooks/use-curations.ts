"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelCuration,
  createCuration,
  deleteCuration,
  getCuration,
  listCurations,
  type CurationCreate,
} from "@/lib/api/curations";

export const curationsQueryKey = ["curations"] as const;
export const curationQueryKey = (id: string) => ["curations", id] as const;

export function useCurations() {
  return useQuery({ queryKey: curationsQueryKey, queryFn: listCurations });
}

/** Polls the job row every 3s while it's non-terminal, as a fallback/
 * cross-check alongside the live SSE stream (use-job-progress.ts) — the
 * stream itself never re-fetches this row, so without polling the detail
 * page would keep showing a stale `status`/`draft_profile_id` after the
 * stream's terminal event closes the connection. The detail page's
 * "Review draft" action reads `draft_profile_id` off this query's data
 * once it lands. */
export function useCuration(curationId: string | undefined) {
  return useQuery({
    queryKey: curationQueryKey(curationId ?? ""),
    queryFn: () => getCuration(curationId as string),
    enabled: Boolean(curationId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "running" ? 3000 : false;
    },
  });
}

/** POST /api/v1/curations/ enqueues an arq task and returns immediately
 * with `status: "pending"` (see lib/api/curations.ts) — a `useMutation`
 * is still the right shape (user-triggered, spends real LLM tokens once a
 * worker picks it up), but callers should navigate to the detail page and
 * let useJobProgress/useCuration track progress from there rather than
 * expecting a finished result back from this call. */
export function useCreateCuration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CurationCreate) => createCuration(body),
    onSuccess: (data) => {
      queryClient.setQueryData(curationQueryKey(data.id), data);
      queryClient.invalidateQueries({ queryKey: curationsQueryKey });
    },
  });
}

export function useDeleteCuration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (curationId: string) => deleteCuration(curationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curationsQueryKey });
    },
  });
}

export function useCancelCuration(curationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelCuration(curationId),
    onSuccess: (data) => {
      queryClient.setQueryData(curationQueryKey(curationId), data);
      queryClient.invalidateQueries({ queryKey: curationsQueryKey });
    },
  });
}
