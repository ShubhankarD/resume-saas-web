"use client";

import { useMemo } from "react";
import type { JDSummary } from "@/lib/api/jds";
import {
  ALL_SOURCES,
  DEFAULT_JD_LIST_QUERY,
  applyJdListQuery,
  distinctSourceTypes,
  type JdListQuery,
} from "@/lib/domain/jd-list";
import { useListQuery } from "@/hooks/use-list-query";

/** `useListQuery` bound to the JD list's query and its setters. */
export function useJdListView(jds: readonly JDSummary[] | undefined) {
  const { query, visible, patch } = useListQuery<JDSummary, JdListQuery>(
    jds,
    applyJdListQuery,
    DEFAULT_JD_LIST_QUERY,
  );
  const sourceTypes = useMemo(() => distinctSourceTypes(jds ?? []), [jds]);

  return {
    query,
    sourceTypes,
    visible,
    setSearch: (search: string) => patch({ search }),
    setSort: (sort: JdListQuery["sort"]) => patch({ sort }),
    setSource: (source: string) => patch({ source }),
    clearFilters: () => patch({ search: "", source: ALL_SOURCES }),
  };
}
