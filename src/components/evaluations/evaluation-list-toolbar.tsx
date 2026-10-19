import { Search } from "lucide-react";
import {
  ALL_STATUSES,
  EVAL_SORTS,
  EVAL_SORT_LABELS,
  type EvaluationListQuery,
  type EvaluationRow,
} from "@/lib/domain/evaluation-list";
import { Input } from "@/components/ui/input";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { CompactTabs } from "@/components/ui/compact-tabs";
import { NativeSelect } from "@/components/ui/native-select";

interface EvaluationListToolbarProps {
  query: EvaluationListQuery;
  rows: readonly EvaluationRow[];
  statuses: readonly string[];
  visibleCount: number;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: EvaluationListQuery["sort"]) => void;
  onStatusChange: (status: string) => void;
}

export function EvaluationListToolbar({
  query,
  rows,
  statuses,
  visibleCount,
  onSearchChange,
  onSortChange,
  onStatusChange,
}: EvaluationListToolbarProps) {
  return (
    <PageToolbar
      className="rounded-lg border px-3 py-2 md:px-4"
      left={
        <>
          <div className="relative w-full sm:w-72">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              type="search"
              aria-label="Search evaluations"
              placeholder="Search profile or role…"
              className="pl-9"
              value={query.search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {statuses.length > 1 ? (
            <CompactTabs
              aria-label="Filter by status"
              value={query.status}
              onValueChange={onStatusChange}
              items={[
                { value: ALL_STATUSES, label: "All", badge: rows.length },
                ...statuses.map((s) => ({
                  value: s,
                  label: s,
                  badge: rows.filter((r) => r.status === s).length,
                })),
              ]}
            />
          ) : null}
        </>
      }
      right={
        <>
          <label htmlFor="evaluations-sort" className="sr-only">
            Sort evaluations
          </label>
          <NativeSelect
            id="evaluations-sort"
            value={query.sort}
            onChange={(e) => onSortChange(e.target.value as EvaluationListQuery["sort"])}
          >
            {EVAL_SORTS.map((key) => (
              <option key={key} value={key}>
                {EVAL_SORT_LABELS[key]}
              </option>
            ))}
          </NativeSelect>
          <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {visibleCount} of {rows.length}
          </span>
        </>
      }
    />
  );
}
