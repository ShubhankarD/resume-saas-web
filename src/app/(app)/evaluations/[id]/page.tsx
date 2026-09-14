"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvaluation } from "@/hooks/use-evaluations";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/content/error-message";
import { EvaluationResults } from "@/components/evaluations/evaluation-results";

/** Permalink view of one evaluation (GET /api/v1/evaluations/{id}) — the
 * same EvaluationResults renderer the JD detail page shows right after
 * triggering one, so a past result looks identical whether it was just
 * created or reopened from history. */
export default function EvaluationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: evaluation, isLoading, error } = useEvaluation(params.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Evaluation</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/evaluations")}>
          Back to list
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      <ErrorMessage error={error} />

      {evaluation && <EvaluationResults evaluation={evaluation} />}
    </div>
  );
}
