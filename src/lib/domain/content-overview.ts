import type { ContentIn } from "@/lib/api/content";

/**
 * What the content-library overview derives from a `ContentIn` record, kept
 * out of the page so it can be unit-tested without React.
 */

/** The four sections a resume can actually draw from. "Completeness" is
 * deliberately literal — how many of them hold at least one entry — so the
 * number never implies a quality judgement the app cannot make. */
export const TRACKED_SECTIONS = 4;

export interface ContentSummary {
  roleCount: number;
  bulletCount: number;
  skillCount: number;
  taglineCount: number;
  educationCount: number;
  sectionsWithContent: number;
  /** Whole percent of `TRACKED_SECTIONS` that hold at least one entry. */
  completeness: number;
  totalEntries: number;
}

/** The slice of `ContentIn` the summary reads — structural, so `ContentIn`
 * satisfies it and tests need not build whole records. */
interface SummarizableContent {
  experience: ReadonlyArray<{ groups: ReadonlyArray<{ bullets: readonly unknown[] }> }>;
  skills: Record<string, unknown>;
  taglines: Record<string, unknown>;
  education: readonly unknown[];
}

export function summarizeContent(content: SummarizableContent): ContentSummary {
  const roleCount = content.experience.length;
  const bulletCount = content.experience.reduce(
    (sum, role) => sum + role.groups.reduce((s, g) => s + g.bullets.length, 0),
    0,
  );
  const skillCount = Object.keys(content.skills).length;
  const taglineCount = Object.keys(content.taglines).length;
  const educationCount = content.education.length;

  const sectionsWithContent = [roleCount, educationCount, skillCount, taglineCount].filter(
    (n) => n > 0,
  ).length;

  return {
    roleCount,
    bulletCount,
    skillCount,
    taglineCount,
    educationCount,
    sectionsWithContent,
    completeness: Math.round((sectionsWithContent / TRACKED_SECTIONS) * 100),
    totalEntries: roleCount + bulletCount + skillCount + taglineCount + educationCount,
  };
}

/** The record "Start from scratch" PUTs: only the name is known. */
export function emptyContent(name: string): ContentIn {
  return {
    name,
    contact: [],
    taglines: {},
    skills: {},
    experience: [],
    education: [],
    application: {},
  };
}
