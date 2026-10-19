import type { EvaluationSummary } from "@/lib/api/evaluations";

/**
 * Client-side search / filter / sort of the evaluation history. The list
 * endpoint has no filter or sort parameters and returns bare ids, so profile
 * and JD names are joined in from the lists the page already loads.
 */

export const EVAL_SORTS = ["newest", "oldest", "score"] as const;
export type EvalSort = (typeof EVAL_SORTS)[number];

export const EVAL_SORT_LABELS: Record<EvalSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  score: "Highest score",
};

export const ALL_STATUSES = "all";

/** An evaluation with the names of what it scored. */
export type EvaluationRow = EvaluationSummary & { profileLabel: string; jdTitle: string };

export function toEvaluationRows(
  evaluations: readonly EvaluationSummary[],
  profiles: readonly { id: string; label: string }[] | undefined,
  jds: readonly { id: string; title?: string | null }[] | undefined,
): EvaluationRow[] {
  return evaluations.map((e) => ({
    ...e,
    profileLabel: profiles?.find((p) => p.id === e.profile_id)?.label ?? e.profile_id,
    jdTitle: jds?.find((j) => j.id === e.jd_id)?.title ?? e.jd_id,
  }));
}

type SortableRow = Pick<EvaluationRow, "created_at" | "overall_score">;

const COMPARATORS: Record<EvalSort, (a: SortableRow, b: SortableRow) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  oldest: (a, b) => a.created_at.localeCompare(b.created_at),
  score: (a, b) => (b.overall_score ?? -1) - (a.overall_score ?? -1),
};

export interface EvaluationListQuery {
  search: string;
  sort: EvalSort;
  /** An evaluation `status`, or `ALL_STATUSES`. */
  status: string;
}

export const DEFAULT_EVALUATION_LIST_QUERY: EvaluationListQuery = {
  search: "",
  sort: "newest",
  status: ALL_STATUSES,
};

export function distinctStatuses(rows: readonly { status: string }[]): string[] {
  return Array.from(new Set(rows.map((r) => r.status))).sort();
}

export function applyEvaluationQuery<
  T extends SortableRow & Pick<EvaluationRow, "status" | "profileLabel" | "jdTitle">,
>(rows: readonly T[], { search, sort, status }: EvaluationListQuery): T[] {
  const needle = search.trim().toLowerCase();
  return rows
    .filter((r) => {
      if (status !== ALL_STATUSES && r.status !== status) return false;
      if (!needle) return true;
      return (
        r.profileLabel.toLowerCase().includes(needle) || r.jdTitle.toLowerCase().includes(needle)
      );
    })
    .sort(COMPARATORS[sort]);
}
