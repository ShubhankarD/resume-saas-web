import { newestFirst } from "@/lib/domain/dates";

/**
 * What the dashboard derives from the lists it already loads, kept out of the
 * page so it can be unit-tested without React.
 */

interface ScoredEvaluation {
  overall_score?: number | null;
}

interface DatedEvaluation {
  created_at: string;
}

export interface ScoreSummary {
  /** Highest overall score, or null when nothing has been scored. */
  best: number | null;
  scoredCount: number;
}

export function summarizeScores(evaluations: readonly ScoredEvaluation[]): ScoreSummary {
  const scores = evaluations.flatMap((e) => (e.overall_score != null ? [e.overall_score] : []));
  return { best: scores.length ? Math.max(...scores) : null, scoredCount: scores.length };
}

/** Newest first — the list endpoint has no ordering guarantee. */
export function recentEvaluations<T extends DatedEvaluation>(
  evaluations: readonly T[],
  limit = 5,
): T[] {
  return newestFirst(evaluations).slice(0, limit);
}

export interface NextStep {
  href: string;
  label: string;
  hint: string;
}

/** The single most useful next action, from what the user already has. */
export function nextStep(counts: { profiles: number; jds: number }): NextStep {
  if (counts.profiles === 0) {
    return {
      href: "/profiles",
      label: "Create your first profile",
      hint: "Start a tailored resume from your content library.",
    };
  }
  if (counts.jds === 0) {
    return {
      href: "/jds",
      label: "Add a job description",
      hint: "Save a posting so you can score a profile against it.",
    };
  }
  return {
    href: "/jds",
    label: "Run an evaluation",
    hint: "Score a profile against a role and close the coverage gaps.",
  };
}

/** Display name for a record id, with a fallback when it is not in the list. */
export function labelFor<T extends { id: string }>(
  items: readonly T[] | undefined,
  id: string,
  pick: (item: T) => string | null | undefined,
  fallback: string,
): string {
  const item = items?.find((i) => i.id === id);
  return (item && pick(item)) ?? fallback;
}
