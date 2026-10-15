"use client";

import { useMemo, useState } from "react";
import type { JDSummary } from "@/lib/api/jds";
import {
  ALL_SOURCES,
  DEFAULT_JD_LIST_QUERY,
  applyJdListQuery,
  distinctSourceTypes,
  type JdListQuery,
} from "@/lib/domain/jd-list";

/** React state around the pure list query in `lib/domain/jd-list`. */
export function useJdListView(jds: readonly JDSummary[] | undefined) {
  const [query, setQuery] = useState<JdListQuery>(DEFAULT_JD_LIST_QUERY);

  const sourceTypes = useMemo(() => distinctSourceTypes(jds ?? []), [jds]);
  const visible = useMemo(() => applyJdListQuery(jds ?? [], query), [jds, query]);

  return {
    query,
    sourceTypes,
    visible,
    setSearch: (search: string) => setQuery((q) => ({ ...q, search })),
    setSort: (sort: JdListQuery["sort"]) => setQuery((q) => ({ ...q, sort })),
    setSource: (source: string) => setQuery((q) => ({ ...q, source })),
    clearFilters: () => setQuery((q) => ({ ...q, search: "", source: ALL_SOURCES })),
  };
}
