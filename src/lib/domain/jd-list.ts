import type { JDSummary } from "@/lib/api/jds";

/**
 * Client-side search / filter / sort of the job-description list. The list
 * endpoint has no filter parameters, so this is pure logic over what
 * `useJds()` already returned. Sort orders are a lookup table of
 * comparators — adding one means adding one row (and its label).
 */

export const JD_SORTS = ["newest", "oldest", "title", "company"] as const;
export type JdSort = (typeof JD_SORTS)[number];

export const JD_SORT_LABELS: Record<JdSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  title: "Title (A–Z)",
  company: "Company (A–Z)",
};

type JdListItem = Pick<JDSummary, "title" | "company" | "source_type" | "created_at">;

const COMPARATORS: Record<JdSort, (a: JdListItem, b: JdListItem) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  oldest: (a, b) => a.created_at.localeCompare(b.created_at),
  title: (a, b) => (a.title ?? "").localeCompare(b.title ?? ""),
  company: (a, b) => (a.company ?? "").localeCompare(b.company ?? ""),
};

export const ALL_SOURCES = "all";

export interface JdListQuery {
  search: string;
  sort: JdSort;
  /** A `source_type` value, or `ALL_SOURCES`. */
  source: string;
}

export const DEFAULT_JD_LIST_QUERY: JdListQuery = {
  search: "",
  sort: "newest",
  source: ALL_SOURCES,
};

export function distinctSourceTypes(jds: readonly JdListItem[]): string[] {
  return Array.from(new Set(jds.map((jd) => jd.source_type))).sort();
}

export function applyJdListQuery<T extends JdListItem>(
  jds: readonly T[],
  { search, sort, source }: JdListQuery,
): T[] {
  const needle = search.trim().toLowerCase();
  return jds
    .filter((jd) => {
      if (source !== ALL_SOURCES && jd.source_type !== source) return false;
      if (!needle) return true;
      return (
        (jd.title ?? "").toLowerCase().includes(needle) ||
        (jd.company ?? "").toLowerCase().includes(needle)
      );
    })
    .sort(COMPARATORS[sort]);
}
