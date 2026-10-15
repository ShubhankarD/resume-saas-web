/** "1 skill" / "2 skills" — the count-with-noun label used across the content library. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
