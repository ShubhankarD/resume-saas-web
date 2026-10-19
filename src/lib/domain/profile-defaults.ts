import { z } from "zod";
import type { ProfileWrite } from "@/lib/api/profiles";
import { CONTENT_KEY_PATTERN, CONTENT_KEY_PATTERN_MESSAGE } from "@/lib/domain/content-key";

/** A profile's unique id-like name (also used to name curated drafts). */
export const profileNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100)
  .regex(CONTENT_KEY_PATTERN, CONTENT_KEY_PATTERN_MESSAGE);

/** The record "New profile" POSTs: identity from the form, everything else
 * the starting defaults of a fresh one-page resume. */
export function newProfileDraft({ name, label }: { name: string; label: string }): ProfileWrite {
  return {
    name,
    label,
    tagline: "default",
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
