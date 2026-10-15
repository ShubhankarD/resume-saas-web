import type { ContentIn, IntakeResponse } from "@/lib/api/content";

/** The intake draft minus its intake-only fields (`warnings`), as a whole-record PUT body. */
export function intakeToContent(draft: IntakeResponse): ContentIn {
  return {
    name: draft.name,
    photo: draft.photo,
    contact: draft.contact,
    taglines: draft.taglines,
    skills: draft.skills,
    experience: draft.experience,
    education: draft.education,
    application: draft.application,
  };
}
