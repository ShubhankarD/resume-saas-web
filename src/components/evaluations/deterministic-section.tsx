import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DeterministicMetrics } from "@/lib/domain/evaluation-report";
import { FindingList, Note, ReportBlock, Stat } from "@/components/evaluations/report-parts";

export function DeterministicSection({ metrics }: { metrics: DeterministicMetrics }) {
  const { page_fit, style_compliance, xyz_format, duplicate_bullets, tag_coverage } = metrics;
  const styleClean =
    style_compliance.over_word_limit.length === 0 && style_compliance.multi_bold.length === 0;

  return (
    <Card data-testid="deterministic-metrics">
      <CardHeader>
        <CardTitle>Deterministic metrics</CardTitle>
        <CardDescription>$0, instant — no LLM call involved.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Page count">{page_fit.page_count}</Stat>
          <Stat label="Fill">{page_fit.fill_pct}%</Stat>
          <Stat label="Underfilled">{page_fit.underfilled ? "Yes" : "No"}</Stat>
          <Stat label="Tag coverage">
            {tag_coverage.matched.length}/{tag_coverage.tags_total} (
            {Math.round(tag_coverage.ratio * 100)}%)
          </Stat>
        </div>

        <Separator />

        <ReportBlock title={`Style compliance (${style_compliance.bullets_total} bullets)`}>
          {styleClean ? (
            <Note>Every bullet is within the word limit with at most one bolded phrase.</Note>
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
        </ReportBlock>

        <ReportBlock
          title={`XYZ/CAR front-loading (${xyz_format.bullets_with_bold} bullets checked)`}
        >
          <FindingList
            muted
            items={xyz_format.back_loaded}
            empty="Every bolded metric is front-loaded in its bullet."
            render={(b) => (
              <>
                Bullet <code>{b.id}</code>&apos;s bolded metric lands at{" "}
                {Math.round(b.position_ratio * 100)}% into the line (back-loaded).
              </>
            )}
          />
        </ReportBlock>

        <ReportBlock title="Duplicate bullets">
          <FindingList
            muted
            items={duplicate_bullets}
            empty="No near-duplicate bullets detected."
            render={(w) => (
              <>
                <Badge variant="outline" className="mr-1">
                  {w.type}
                </Badge>
                {w.message}
              </>
            )}
          />
        </ReportBlock>
      </CardContent>
    </Card>
  );
}
