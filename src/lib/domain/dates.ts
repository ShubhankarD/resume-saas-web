/** `Oct 19` (or `Oct 19, 2026` with `withYear`) in the app's display locale. */
export function formatDate(value: string, { withYear = false } = {}): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/** A copy of `items` ordered newest first by `created_at` (missing sorts last). */
export function newestFirst<T extends { created_at?: string | null }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}
