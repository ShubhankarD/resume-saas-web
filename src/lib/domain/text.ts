/** Trimmed text, or `undefined` when blank — the API's "field omitted". */
export function blankToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
