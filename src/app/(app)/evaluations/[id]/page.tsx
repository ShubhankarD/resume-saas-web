"use client";

import { useParams } from "next/navigation";
import { useEvaluation } from "@/hooks/use-evaluations";
import { useJds } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";
import { EvaluationResults } from "@/components/evaluations/evaluation-results";

/** Permalink view of one evaluation (GET /api/v1/evaluations/{id}) — the
 * same EvaluationResults renderer the JD detail page shows right after
 * triggering one, so a past result looks identical whether it was just
 * created or reopened from history. */
export default function EvaluationDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: evaluation, isLoading, error } = useEvaluation(params.id);
  const { data: jds } = useJds();
  const { data: profiles } = useProfiles();

  const profileLabel = evaluation
    ? (profiles?.find((p) => p.id === evaluation.profile_id)?.label ?? null)
    : null;
  const jdTitle = evaluation ? (jds?.find((j) => j.id === evaluation.jd_id)?.title ?? null) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/evaluations"
        eyebrow="Evaluation"
        title={profileLabel ?? (isLoading ? "Loading…" : "Evaluation")}
        description={jdTitle ? `Scored against ${jdTitle}` : undefined}
      />

      <ErrorMessage error={error} />

      {isLoading && (
        <Card aria-hidden="true">
          <CardContent className="space-y-3">
            <div className="bg-muted h-6 w-40 animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-10/12 animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-8/12 animate-pulse rounded-md" />
          </CardContent>
        </Card>
      )}

      {evaluation && <EvaluationResults evaluation={evaluation} />}
    </div>
  );
}
