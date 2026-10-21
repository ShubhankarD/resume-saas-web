import { z } from "zod";
import type { ProfileWrite } from "@/lib/api/profiles";
import { CONTENT_KEY_PATTERN, CONTENT_KEY_PATTERN_MESSAGE } from "@/lib/domain/content-key";

/** A profile's unique id-like name (also used to name curated drafts). */
export const profileNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100)
  .regex(CONTENT_KEY_PATTERN, CONTENT_KEY_PATTERN_MESSAGE);

const FALLBACK_TAGLINE = "default";

/** The tagline a new profile starts on: "default" when the library has it,
 * otherwise the first key it does have (the backend rejects unknown keys). */
export function defaultTaglineKey(taglineKeys: readonly string[]): string {
  return taglineKeys.includes(FALLBACK_TAGLINE)
    ? FALLBACK_TAGLINE
    : (taglineKeys[0] ?? FALLBACK_TAGLINE);
}

/** The record "New profile" POSTs: identity from the form, everything else
 * the starting defaults of a fresh one-page resume. */
export function newProfileDraft(
  { name, label }: { name: string; label: string },
  taglineKeys: readonly string[] = [],
): ProfileWrite {
  return {
    name,
    label,
    tagline: defaultTaglineKey(taglineKeys),
    density: "tight",
    max_pages: 1,
    template: "resume.html.j2",
    skills_order: [],
    skill_overrides: {},
    groups_order: [],
    experience: null,
    education: null,
    headings: {},
    bullets: {},
    bullet_overrides: {},
  };
}
