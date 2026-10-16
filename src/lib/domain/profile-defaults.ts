import type { ProfileWrite } from "@/lib/api/profiles";

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
