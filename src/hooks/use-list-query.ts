"use client";

import { useMemo, useState } from "react";

/**
 * React state for a client-side list view: holds the query (search / sort /
 * filter fields) and derives the visible items by running the pure `apply`
 * function from `lib/domain` over them. `apply` should be a stable module
 * function; `patch` merges a partial query.
 */
export function useListQuery<T, Q>(
  items: readonly T[] | undefined,
  apply: (items: readonly T[], query: Q) => T[],
  initial: Q,
) {
  const [query, setQuery] = useState<Q>(initial);
  const visible = useMemo(() => apply(items ?? [], query), [items, query, apply]);

  return {
    query,
    visible,
    patch: (partial: Partial<Q>) => setQuery((q) => ({ ...q, ...partial })),
    reset: () => setQuery(initial),
  };
}
