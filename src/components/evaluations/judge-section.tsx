import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  COVERAGE_BADGE_VARIANT,
  type JudgeReport,
  type ScoredAxis,
} from "@/lib/domain/evaluation-report";
import { FindingList, ReportBlock } from "@/components/evaluations/report-parts";

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
      <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">{axis.reason}</p>
    </div>
  );
}

export function JudgeSection({ report }: { report: JudgeReport }) {
  return (
    <Card data-testid="judge-feedback">
      <CardHeader>
        <CardTitle>LLM-judge feedback</CardTitle>
        <CardDescription>
          Structured feedback from the evaluation&apos;s judge call.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AxisScore label="Technical fit" axis={report.technical_fit} />
          <AxisScore label="Seniority fit" axis={report.seniority_fit} />
          <AxisScore label="Domain fit" axis={report.domain_fit} />
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReportBlock title="Strengths">
            <FindingList items={report.strengths} empty="None called out." render={(s) => s} />
          </ReportBlock>
          <ReportBlock title="Gaps">
            <FindingList items={report.gaps} empty="None called out." render={(g) => g} />
          </ReportBlock>
        </div>

        <ReportBlock title="Recommendation">
          <p className="text-xs">{report.recommendation}</p>
        </ReportBlock>

        {report.unverifiable_claims.length > 0 && (
          <ReportBlock title="Unverifiable claims (flagged for human review)">
            <FindingList items={report.unverifiable_claims} render={(c) => c} />
          </ReportBlock>
        )}

        {report.incoherent_bullets.length > 0 && (
          <ReportBlock title="Bullets that read as incoherent in this order">
            <FindingList
              items={report.incoherent_bullets}
              render={(b) => (
                <>
                  <code>{b.bullet_id}</code>: {b.issue}
                </>
              )}
            />
          </ReportBlock>
        )}

        <ReportBlock title="Requirement coverage">
          <ul className="flex flex-col gap-1">
            {report.requirement_coverage.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Badge variant={COVERAGE_BADGE_VARIANT[c.status]} className="mt-0.5 shrink-0">
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
        </ReportBlock>
      </CardContent>
    </Card>
  );
}
