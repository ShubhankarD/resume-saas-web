import { Search } from "lucide-react";
import type { JDSummary } from "@/lib/api/jds";
import { JD_SORTS, JD_SORT_LABELS, ALL_SOURCES, type JdListQuery } from "@/lib/domain/jd-list";
import { Input } from "@/components/ui/input";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { CompactTabs } from "@/components/ui/compact-tabs";
import { NativeSelect } from "@/components/ui/native-select";

interface JdListToolbarProps {
  query: JdListQuery;
  jds: readonly JDSummary[];
  sourceTypes: readonly string[];
  visibleCount: number;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: JdListQuery["sort"]) => void;
  onSourceChange: (source: string) => void;
}

export function JdListToolbar({
  query,
  jds,
  sourceTypes,
  visibleCount,
  onSearchChange,
  onSortChange,
  onSourceChange,
}: JdListToolbarProps) {
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
              aria-label="Search job descriptions"
              placeholder="Search title or company…"
              className="pl-9"
              value={query.search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {sourceTypes.length > 1 ? (
            <CompactTabs
              aria-label="Filter by source"
              value={query.source}
              onValueChange={onSourceChange}
              items={[
                { value: ALL_SOURCES, label: "All", badge: jds.length },
                ...sourceTypes.map((type) => ({
                  value: type,
                  label: type,
                  badge: jds.filter((jd) => jd.source_type === type).length,
                })),
              ]}
            />
          ) : null}
        </>
      }
      right={
        <>
          <label htmlFor="jds-sort" className="sr-only">
            Sort job descriptions
          </label>
          <NativeSelect
            id="jds-sort"
            value={query.sort}
            onChange={(e) => onSortChange(e.target.value as JdListQuery["sort"])}
          >
            {JD_SORTS.map((key) => (
              <option key={key} value={key}>
                {JD_SORT_LABELS[key]}
              </option>
            ))}
          </NativeSelect>
          <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {visibleCount} of {jds.length}
          </span>
        </>
      }
    />
  );
}
