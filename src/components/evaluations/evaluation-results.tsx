import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EvaluationResponse } from "@/lib/api/evaluations";

/**
 * Renders one finished `EvaluationResponse` — both the deterministic
 * metrics (`evaluation.deterministic`, shape from
 * `app/services/eval_metrics.py::deterministic_metrics()`) and, when
 * present, the LLM-judge's structured feedback (`evaluation.llm_report`,
 * shape from `app/services/curation/judge.py::build_judge_schema()`).
 *
 * `deterministic`/`llm_report` are typed as loose `{[key: string]: unknown}`
 * in the generated schema (the backend stores them as JSONB, not a typed
 * Pydantic sub-model), so this component defines its own narrow local types
 * matching the real backend shapes read directly out of judge.py/
 * eval_metrics.py, and guards every field access — a `status='failed'`
 * evaluation (e.g. the missing-GEMINI_API_KEY case) has `llm_report: null`
 * and a real `error_message`, which is rendered instead.
 */

interface ScoredAxis {
  score: number;
  reason: string;
}

interface RequirementCoverageEntry {
  requirement: string;
  status: "covered" | "partial" | "gap";
  evidence_bullet_id: string | null;
  note: string;
}

interface IncoherentBullet {
  bullet_id: string;
  issue: string;
}

interface JudgeReport {
  requirement_coverage: RequirementCoverageEntry[];
  technical_fit: ScoredAxis;
  seniority_fit: ScoredAxis;
  domain_fit: ScoredAxis;
  strengths: string[];
  gaps: string[];
  unverifiable_claims: string[];
  incoherent_bullets: IncoherentBullet[];
  recommendation: string;
}

interface PageFit {
  page_count: number;
  underfilled: boolean;
  fill_pct: number;
}

interface StyleCompliance {
  bullets_total: number;
  over_word_limit: { id: string; words: number }[];
  multi_bold: { id: string; bold_count: number }[];
}

interface XyzFormat {
  bullets_with_bold: number;
  back_loaded: { id: string; position_ratio: number }[];
}

interface DuplicateBullet {
  type: string;
  message: string;
}

interface TagCoverage {
  tags_total: number;
  matched: string[];
  ratio: number;
}

interface DeterministicMetrics {
  page_fit: PageFit;
  style_compliance: StyleCompliance;
  xyz_format: XyzFormat;
  duplicate_bullets: DuplicateBullet[];
  tag_coverage: TagCoverage;
}

function coverageBadgeVariant(status: string): "default" | "secondary" | "destructive" {
  if (status === "covered") return "default";
  if (status === "partial") return "secondary";
  return "destructive";
}

function DeterministicSection({ deterministic }: { deterministic: DeterministicMetrics }) {
  const { page_fit, style_compliance, xyz_format, duplicate_bullets, tag_coverage } = deterministic;
  return (
    <Card data-testid="deterministic-metrics">
      <CardHeader>
        <CardTitle>Deterministic metrics</CardTitle>
        <CardDescription>$0, instant — no LLM call involved.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div className="space-y-1">
            <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Page count
            </span>
            <span className="text-lg font-semibold tabular-nums">{page_fit.page_count}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Fill
            </span>
            <span className="text-lg font-semibold tabular-nums">{page_fit.fill_pct}%</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Underfilled
            </span>
            <span className="text-lg font-semibold">{page_fit.underfilled ? "Yes" : "No"}</span>
          </div>
          <div className="space-y-1">
            <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Tag coverage
            </span>
            <span className="text-lg font-semibold tabular-nums">
              {tag_coverage.matched.length}/{tag_coverage.tags_total} (
              {Math.round(tag_coverage.ratio * 100)}%)
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-1.5">
          <span className="font-medium">
            Style compliance ({style_compliance.bullets_total} bullets)
          </span>
          {style_compliance.over_word_limit.length === 0 &&
          style_compliance.multi_bold.length === 0 ? (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Every bullet is within the word limit with at most one bolded phrase.
            </p>
          ) : (
            <ul className="text-muted-foreground list-inside list-disc text-xs">
              {style_compliance.over_word_limit.map((b) => (
                <li key={`words-${b.id}`}>
                  Bullet <code>{b.id}</code> is {b.words} words (over the limit).
                </li>
              ))}
              {style_compliance.multi_bold.map((b) => (
                <li key={`bold-${b.id}`}>
                  Bullet <code>{b.id}</code> has {b.bold_count} bolded phrases.
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-medium">
            XYZ/CAR front-loading ({xyz_format.bullets_with_bold} bullets checked)
          </span>
          {xyz_format.back_loaded.length === 0 ? (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Every bolded metric is front-loaded in its bullet.
            </p>
          ) : (
            <ul className="text-muted-foreground list-inside list-disc text-xs">
              {xyz_format.back_loaded.map((b) => (
                <li key={b.id}>
                  Bullet <code>{b.id}</code>&apos;s bolded metric lands at{" "}
                  {Math.round(b.position_ratio * 100)}% into the line (back-loaded).
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-medium">Duplicate bullets</span>
          {duplicate_bullets.length === 0 ? (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              No near-duplicate bullets detected.
            </p>
          ) : (
            <ul className="text-muted-foreground list-inside list-disc text-xs">
              {duplicate_bullets.map((w, i) => (
                <li key={i}>
                  <Badge variant="outline" className="mr-1">
                    {w.type}
                  </Badge>
                  {w.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AxisScore({ label, axis }: { label: string; axis: ScoredAxis }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          {label}
        </span>
        <Badge variant="secondary" className="tabular-nums">
          {axis.score}/10
        </Badge>
      </div>
      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{axis.reason}</p>
    </div>
  );
}

function JudgeSection({ report }: { report: JudgeReport }) {
  return (
    <Card data-testid="judge-feedback">
      <CardHeader>
        <CardTitle>LLM-judge feedback</CardTitle>
        <CardDescription>
          Structured feedback from the evaluation&apos;s judge call.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <AxisScore label="Technical fit" axis={report.technical_fit} />
          <AxisScore label="Seniority fit" axis={report.seniority_fit} />
          <AxisScore label="Domain fit" axis={report.domain_fit} />
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="font-medium">Strengths</span>
            {report.strengths.length === 0 ? (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                None called out.
              </p>
            ) : (
              <ul className="list-inside list-disc text-xs">
                {report.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-medium">Gaps</span>
            {report.gaps.length === 0 ? (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                None called out.
              </p>
            ) : (
              <ul className="list-inside list-disc text-xs">
                {report.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-medium">Recommendation</span>
          <p className="text-xs">{report.recommendation}</p>
        </div>

        {report.unverifiable_claims.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium">Unverifiable claims (flagged for human review)</span>
            <ul className="list-inside list-disc text-xs">
              {report.unverifiable_claims.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {report.incoherent_bullets.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium">Bullets that read as incoherent in this order</span>
            <ul className="list-inside list-disc text-xs">
              {report.incoherent_bullets.map((b, i) => (
                <li key={i}>
                  <code>{b.bullet_id}</code>: {b.issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="font-medium">Requirement coverage</span>
          <ul className="flex flex-col gap-1">
            {report.requirement_coverage.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Badge variant={coverageBadgeVariant(c.status)} className="mt-0.5 shrink-0">
                  {c.status}
                </Badge>
                <span>
                  <strong>{c.requirement}</strong> — {c.note}
                  {c.evidence_bullet_id && (
                    <>
                      {" "}
                      (<code>{c.evidence_bullet_id}</code>)
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreTile({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
        {score}
        <span className="text-base font-semibold text-slate-400">/10</span>
      </p>
    </div>
  );
}

export function EvaluationResults({ evaluation }: { evaluation: EvaluationResponse }) {
  const deterministic = evaluation.deterministic as unknown as DeterministicMetrics | null;
  const llmReport = evaluation.llm_report as unknown as JudgeReport | null;
  const hasScores = evaluation.overall_score != null || evaluation.coverage_score != null;

  return (
    <div className="space-y-6" data-testid="evaluation-results">
      <Card>
        <CardContent className="flex flex-wrap items-end justify-between gap-6">
          {hasScores ? (
            <div className="flex flex-wrap gap-10">
              {evaluation.overall_score != null && (
                <ScoreTile label="Overall fit" score={evaluation.overall_score} />
              )}
              {evaluation.coverage_score != null && (
                <ScoreTile label="Requirement coverage" score={evaluation.coverage_score} />
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No scores were produced for this run.
            </p>
          )}
          <Badge variant={evaluation.status === "completed" ? "default" : "destructive"}>
            {evaluation.status}
          </Badge>
        </CardContent>
      </Card>

      {evaluation.status === "failed" && evaluation.error_message && (
        <p
          role="alert"
          data-testid="evaluation-error"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
        >
          This evaluation failed: {evaluation.error_message}
        </p>
      )}

      {deterministic && <DeterministicSection deterministic={deterministic} />}
      {llmReport && <JudgeSection report={llmReport} />}
    </div>
  );
}
