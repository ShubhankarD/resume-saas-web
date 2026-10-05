"use client";

import { useQuery } from "@tanstack/react-query";
import { listTemplates } from "@/lib/api/templates";
import { queryKeys } from "@/lib/query-keys";

/** Static gallery metadata, no per-user data — safe to cache indefinitely
 * for the life of the session (see app/api/templates.py: no CurrentUser
 * dependency, deliberately unauthenticated). */
export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: listTemplates,
    staleTime: Infinity,
  });
}
