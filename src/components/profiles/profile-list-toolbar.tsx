import { Search } from "lucide-react";
import {
  PROFILE_SORTS,
  PROFILE_SORT_LABELS,
  type ProfileListQuery,
} from "@/lib/domain/profile-list";
import { Input } from "@/components/ui/input";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { NativeSelect } from "@/components/ui/native-select";

interface ProfileListToolbarProps {
  query: ProfileListQuery;
  visibleCount: number;
  totalCount: number;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: ProfileListQuery["sort"]) => void;
}

export function ProfileListToolbar({
  query,
  visibleCount,
  totalCount,
  onSearchChange,
  onSortChange,
}: ProfileListToolbarProps) {
  return (
    <PageToolbar
      className="rounded-lg border px-3 py-2 md:px-4"
      left={
        <div className="relative w-full sm:w-72">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            type="search"
            aria-label="Search profiles"
            placeholder="Search profiles…"
            className="pl-9"
            value={query.search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      }
      right={
        <>
          <label htmlFor="profiles-sort" className="sr-only">
            Sort profiles
          </label>
          <NativeSelect
            id="profiles-sort"
            value={query.sort}
            onChange={(e) => onSortChange(e.target.value as ProfileListQuery["sort"])}
          >
            {PROFILE_SORTS.map((key) => (
              <option key={key} value={key}>
                {PROFILE_SORT_LABELS[key]}
              </option>
            ))}
          </NativeSelect>
          <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {visibleCount} of {totalCount}
          </span>
        </>
      }
    />
  );
}
