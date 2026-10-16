"use client";

import { useMemo, useState } from "react";
import type { ProfileSummary } from "@/lib/api/profiles";
import {
  DEFAULT_PROFILE_LIST_QUERY,
  applyProfileListQuery,
  type ProfileListQuery,
} from "@/lib/domain/profile-list";

/** React state around the pure list query in `lib/domain/profile-list`. */
export function useProfileListView(profiles: readonly ProfileSummary[] | undefined) {
  const [query, setQuery] = useState<ProfileListQuery>(DEFAULT_PROFILE_LIST_QUERY);
  const visible = useMemo(() => applyProfileListQuery(profiles ?? [], query), [profiles, query]);

  return {
    query,
    visible,
    setSearch: (search: string) => setQuery((q) => ({ ...q, search })),
    setSort: (sort: ProfileListQuery["sort"]) => setQuery((q) => ({ ...q, sort })),
    clearSearch: () => setQuery((q) => ({ ...q, search: "" })),
  };
}
