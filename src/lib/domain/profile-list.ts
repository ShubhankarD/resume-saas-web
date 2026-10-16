import type { ProfileSummary } from "@/lib/api/profiles";

/**
 * Client-side search / sort of the profile list. The list endpoint takes no
 * parameters, so this is pure logic over what `useProfiles()` returned. Sort
 * orders are a lookup table of comparators.
 */

export const PROFILE_SORTS = ["label", "name", "pages"] as const;
export type ProfileSort = (typeof PROFILE_SORTS)[number];

export const PROFILE_SORT_LABELS: Record<ProfileSort, string> = {
  label: "Label (A–Z)",
  name: "Name (A–Z)",
  pages: "Most pages",
};

type ProfileListItem = Pick<ProfileSummary, "label" | "name" | "tagline" | "max_pages">;

const COMPARATORS: Record<ProfileSort, (a: ProfileListItem, b: ProfileListItem) => number> = {
  label: (a, b) => a.label.localeCompare(b.label),
  name: (a, b) => a.name.localeCompare(b.name),
  pages: (a, b) => b.max_pages - a.max_pages || a.label.localeCompare(b.label),
};

export interface ProfileListQuery {
  search: string;
  sort: ProfileSort;
}

export const DEFAULT_PROFILE_LIST_QUERY: ProfileListQuery = { search: "", sort: "label" };

export function applyProfileListQuery<T extends ProfileListItem>(
  profiles: readonly T[],
  { search, sort }: ProfileListQuery,
): T[] {
  const needle = search.trim().toLowerCase();
  return profiles
    .filter(
      (p) =>
        !needle ||
        p.label.toLowerCase().includes(needle) ||
        p.name.toLowerCase().includes(needle) ||
        p.tagline.toLowerCase().includes(needle),
    )
    .sort(COMPARATORS[sort]);
}
