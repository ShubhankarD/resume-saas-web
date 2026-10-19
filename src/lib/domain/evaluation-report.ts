import { z } from "zod";

/**
 * The evaluation's `deterministic` and `llm_report` fields are stored as
 * JSONB, so the generated OpenAPI types call them `{[key: string]: unknown}`.
 * These schemas are the shapes the backend actually writes
 * (`app/services/eval_metrics.py::deterministic_metrics()` and
 * `app/services/curation/judge.py::build_judge_schema()`), and the parsers
 * validate instead of casting: a mismatching payload yields `null` (the
 * section is simply not shown) rather than a crash on the first missing field.
 */

const scoredAxis = z.object({ score: z.number(), reason: z.string() });

const judgeReportSchema = z.object({
  requirement_coverage: z.array(
    z.object({
      requirement: z.string(),
      status: z.enum(["covered", "partial", "gap"]),
      evidence_bullet_id: z.string().nullable(),
      note: z.string(),
    }),
  ),
  technical_fit: scoredAxis,
  seniority_fit: scoredAxis,
  domain_fit: scoredAxis,
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  unverifiable_claims: z.array(z.string()),
  incoherent_bullets: z.array(z.object({ bullet_id: z.string(), issue: z.string() })),
  recommendation: z.string(),
});

const deterministicSchema = z.object({
  page_fit: z.object({
    page_count: z.number(),
    underfilled: z.boolean(),
    fill_pct: z.number(),
  }),
  style_compliance: z.object({
    bullets_total: z.number(),
    over_word_limit: z.array(z.object({ id: z.string(), words: z.number() })),
    multi_bold: z.array(z.object({ id: z.string(), bold_count: z.number() })),
  }),
  xyz_format: z.object({
    bullets_with_bold: z.number(),
    back_loaded: z.array(z.object({ id: z.string(), position_ratio: z.number() })),
  }),
  duplicate_bullets: z.array(z.object({ type: z.string(), message: z.string() })),
  tag_coverage: z.object({
    tags_total: z.number(),
    matched: z.array(z.string()),
    ratio: z.number(),
  }),
});

export type JudgeReport = z.infer<typeof judgeReportSchema>;
export type ScoredAxis = z.infer<typeof scoredAxis>;
export type DeterministicMetrics = z.infer<typeof deterministicSchema>;
export type CoverageStatus = JudgeReport["requirement_coverage"][number]["status"];

export function parseJudgeReport(value: unknown): JudgeReport | null {
  const result = judgeReportSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseDeterministic(value: unknown): DeterministicMetrics | null {
  const result = deterministicSchema.safeParse(value);
  return result.success ? result.data : null;
}

/** Badge variant per requirement-coverage status. */
export const COVERAGE_BADGE_VARIANT: Record<
  CoverageStatus,
  "default" | "secondary" | "destructive"
> = { covered: "default", partial: "secondary", gap: "destructive" };
