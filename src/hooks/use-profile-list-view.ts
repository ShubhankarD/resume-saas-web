"use client";

import type { ProfileSummary } from "@/lib/api/profiles";
import {
  DEFAULT_PROFILE_LIST_QUERY,
  applyProfileListQuery,
  type ProfileListQuery,
} from "@/lib/domain/profile-list";
import { useListQuery } from "@/hooks/use-list-query";

/** `useListQuery` bound to the profile list's query and its setters. */
export function useProfileListView(profiles: readonly ProfileSummary[] | undefined) {
  const { query, visible, patch } = useListQuery<ProfileSummary, ProfileListQuery>(
    profiles,
    applyProfileListQuery,
    DEFAULT_PROFILE_LIST_QUERY,
  );

  return {
    query,
    visible,
    setSearch: (search: string) => patch({ search }),
    setSort: (sort: ProfileListQuery["sort"]) => patch({ sort }),
    clearSearch: () => patch({ search: "" }),
  };
}
