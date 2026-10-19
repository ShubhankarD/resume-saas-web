"use client";

import { useMemo } from "react";
import type { EvaluationSummary } from "@/lib/api/evaluations";
import {
  ALL_STATUSES,
  DEFAULT_EVALUATION_LIST_QUERY,
  applyEvaluationQuery,
  distinctStatuses,
  toEvaluationRows,
  type EvaluationListQuery,
  type EvaluationRow,
} from "@/lib/domain/evaluation-list";
import { useListQuery } from "@/hooks/use-list-query";

/** The evaluation list: rows joined with profile/JD names, plus its query state. */
export function useEvaluationListView(
  evaluations: readonly EvaluationSummary[] | undefined,
  profiles: readonly { id: string; label: string }[] | undefined,
  jds: readonly { id: string; title?: string | null }[] | undefined,
) {
  const rows = useMemo(
    () => toEvaluationRows(evaluations ?? [], profiles, jds),
    [evaluations, profiles, jds],
  );
  const { query, visible, patch } = useListQuery<EvaluationRow, EvaluationListQuery>(
    rows,
    applyEvaluationQuery,
    DEFAULT_EVALUATION_LIST_QUERY,
  );
  const statuses = useMemo(() => distinctStatuses(rows), [rows]);

  return {
    query,
    rows,
    statuses,
    visible,
    setSearch: (search: string) => patch({ search }),
    setSort: (sort: EvaluationListQuery["sort"]) => patch({ sort }),
    setStatus: (status: string) => patch({ status }),
    clearFilters: () => patch({ search: "", status: ALL_STATUSES }),
  };
}
