"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBuild, deleteBuild, listBuilds, type BuildCreate } from "@/lib/api/builds";

export const buildsQueryKey = ["builds"] as const;

/** GET /api/v1/builds/ has no profile filter server-side (it's a flat,
 * tenant-scoped list of every build the user owns) — the per-profile build
 * history in the editor filters this client-side by `profile_id`. */
export function useBuilds() {
  return useQuery({ queryKey: buildsQueryKey, queryFn: listBuilds });
}

export function useCreateBuild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BuildCreate) => createBuild(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildsQueryKey });
    },
  });
}

export function useDeleteBuild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (buildId: string) => deleteBuild(buildId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildsQueryKey });
    },
  });
}
