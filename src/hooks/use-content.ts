"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { getContent, type ContentIn } from "@/lib/api/content";

export const contentQueryKey = ["content"] as const;

/**
 * Shared GET /api/v1/content/ query. A 404 means "no content record yet"
 * (see app/api/content.py's get_content()) — the empty state, not a hard
 * error — so it's surfaced as `content: null` instead of `error`. Any other
 * failure (401 already handled by apiFetch's refresh-retry, 5xx, network)
 * still comes back as `error` for the caller to render.
 */
export function useContent() {
  const query = useQuery<ContentIn | null>({
    queryKey: contentQueryKey,
    queryFn: async () => {
      try {
        return await getContent();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  return query;
}
