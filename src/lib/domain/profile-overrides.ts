import type { ProfileWrite } from "@/lib/api/profiles";

/**
 * Pure edit rules for a profile draft's per-resume overrides and selections,
 * each returning the new value to patch into the draft.
 */

type SkillOverrides = NonNullable<ProfileWrite["skill_overrides"]>;

/** Set `map[key] = value`, or drop the key when the value is blank or just
 * the original content (so "no override" stays represented by absence). */
export function withTextOverride(
  map: Readonly<Record<string, string>> | undefined,
  key: string,
  value: string,
  original: string | null | undefined,
): Record<string, string> {
  const next = { ...(map ?? {}) };
  if (value.trim() === "" || value === original) delete next[key];
  else next[key] = value;
  return next;
}

/** Include/exclude one bullet. `selected` is the explicit selection or
 * `undefined` for "all"; a re-included bullet goes back to its content position. */
export function withBulletToggled(
  selected: readonly string[] | undefined,
  allBulletIds: readonly string[],
  bulletId: string,
  checked: boolean,
): string[] {
  const base = selected ?? allBulletIds;
  return checked
    ? allBulletIds.filter((id) => base.includes(id) || id === bulletId)
    : base.filter((id) => id !== bulletId);
}

/** Edit one field of a skill group's override; drops the override entirely
 * once it matches the content again. */
export function withSkillOverride(
  overrides: Readonly<SkillOverrides> | undefined,
  key: string,
  original: { label: string; text: string },
  field: "label" | "text",
  value: string,
): SkillOverrides {
  const current = overrides?.[key] ?? original;
  const next = { ...current, [field]: value };
  const result = { ...(overrides ?? {}) };
  if (next.label === original.label && next.text === original.text) delete result[key];
  else result[key] = next;
  return result;
}

/** Add or remove a skill group; `null` when adding would exceed `max`. */
export function withSkillToggled(
  selected: readonly string[],
  key: string,
  checked: boolean,
  max: number,
): string[] | null {
  if (!checked) return selected.filter((k) => k !== key);
  return selected.length >= max ? null : [...selected, key];
}

/** How many groups must be removed to fit `max` (0 when already within it). */
export function skillsOverLimit(selected: readonly string[], max: number): number {
  return Math.max(0, selected.length - max);
}
