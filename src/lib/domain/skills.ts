/**
 * A skill group's `text` is one freeform string on the backend
 * (SkillGroupIn), so tokens are a *display* convenience only: we split on
 * commas to show chips, and every edit still writes the whole string back
 * unchanged in shape. Text without commas degrades to a single chip.
 */
export function toTokens(text: string): string[] {
  return text
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

interface SkillGroupLike {
  label: string;
  text: string;
}

/** Case-insensitive match of the query against key, label and text; an empty query keeps all. */
export function filterSkillGroups<E extends readonly [string, SkillGroupLike]>(
  entries: readonly E[],
  search: string,
): E[] {
  const query = search.trim().toLowerCase();
  if (!query) return [...entries];
  return entries.filter(
    ([key, group]) =>
      key.toLowerCase().includes(query) ||
      group.label.toLowerCase().includes(query) ||
      group.text.toLowerCase().includes(query),
  );
}
