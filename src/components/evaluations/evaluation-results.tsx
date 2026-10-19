import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import type { EvaluationResponse } from "@/lib/api/evaluations";
import { parseDeterministic, parseJudgeReport } from "@/lib/domain/evaluation-report";
import { DeterministicSection } from "@/components/evaluations/deterministic-section";
import { JudgeSection } from "@/components/evaluations/judge-section";

/**
 * Renders one finished `EvaluationResponse`: the score cards, a failed run's
 * error, and the deterministic metrics and LLM-judge feedback when present.
 * Both JSONB payloads are validated by `lib/domain/evaluation-report`; a
 * `status='failed'` run (e.g. no GEMINI_API_KEY) has `llm_report: null` and a
 * real `error_message`, which is shown instead.
 */
export function EvaluationResults({ evaluation }: { evaluation: EvaluationResponse }) {
  const deterministic = parseDeterministic(evaluation.deterministic);
  const llmReport = parseJudgeReport(evaluation.llm_report);
  const hasScores = evaluation.overall_score != null || evaluation.coverage_score != null;

  return (
    <div className="space-y-4" data-testid="evaluation-results">
      {hasScores ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {evaluation.overall_score != null && (
            <MetricCard
              label="Overall fit"
              value={`${evaluation.overall_score}/10`}
              progress={evaluation.overall_score * 10}
            />
          )}
          {evaluation.coverage_score != null && (
            <MetricCard
              label="Requirement coverage"
              value={`${evaluation.coverage_score}/10`}
              progress={evaluation.coverage_score * 10}
            />
          )}
          <MetricCard
            label="Status"
            value={evaluation.status}
            hint={
              evaluation.status === "completed"
                ? "Judge and metrics both ran"
                : "See the message below"
            }
          />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No scores were produced for this run.
            </p>
            <Badge variant={evaluation.status === "completed" ? "default" : "destructive"}>
              {evaluation.status}
            </Badge>
          </CardContent>
        </Card>
      )}

      {evaluation.status === "failed" && evaluation.error_message && (
        <p
          role="alert"
          data-testid="evaluation-error"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
        >
          This evaluation failed: {evaluation.error_message}
        </p>
      )}

      {deterministic && <DeterministicSection metrics={deterministic} />}
      {llmReport && <JudgeSection report={llmReport} />}
    </div>
  );
}
