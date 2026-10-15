/**
 * A profile stores the tagline *key* it uses (ProfileSummary.tagline), so
 * usage counts are a client-side tally over the already-cached profile list,
 * not a new endpoint.
 */
export function tallyTaglineUsage(profiles: readonly { tagline: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const profile of profiles) {
    counts.set(profile.tagline, (counts.get(profile.tagline) ?? 0) + 1);
  }
  return counts;
}
