"use client";

import { useQuery } from "@tanstack/react-query";
import { listTemplates } from "@/lib/api/templates";

export const templatesQueryKey = ["templates"] as const;

/** Static gallery metadata, no per-user data — safe to cache indefinitely
 * for the life of the session (see app/api/templates.py: no CurrentUser
 * dependency, deliberately unauthenticated). */
export function useTemplates() {
  return useQuery({
    queryKey: templatesQueryKey,
    queryFn: listTemplates,
    staleTime: Infinity,
  });
}
