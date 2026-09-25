"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEvaluation } from "@/hooks/use-evaluations";
import { useJds } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { Card, CardContent } from "@/components/ui/card";
import { PageToolbar } from "@/components/ui/page-toolbar";
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
    <div className="space-y-6">
      <PageToolbar
        className="-mx-4 -mt-5 w-auto px-4 md:-mx-6 md:-mt-6 md:px-6 lg:-mx-8 lg:px-8"
        left={
          <>
            <Link
              href="/evaluations"
              aria-label="Back to evaluations"
              className="focus-visible:ring-ring/50 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-[-0.02em] text-slate-900 sm:text-2xl dark:text-slate-50">
                {profileLabel ?? (isLoading ? "Loading…" : "Evaluation")}
              </h1>
              {jdTitle ? (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Scored against {jdTitle}
                </p>
              ) : null}
            </div>
          </>
        }
        right={
          evaluation ? (
            <Link
              href={`/jds/${evaluation.jd_id}`}
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline dark:text-slate-400"
            >
              Re-run against this role
            </Link>
          ) : undefined
        }
      />

      <ErrorMessage error={error} />

      {isLoading && (
        <Card aria-hidden="true">
          <CardContent className="space-y-2.5">
            <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
            <div className="bg-muted h-3 w-full animate-pulse rounded-md" />
            <div className="bg-muted h-3 w-10/12 animate-pulse rounded-md" />
            <div className="bg-muted h-3 w-8/12 animate-pulse rounded-md" />
          </CardContent>
        </Card>
      )}

      {evaluation && <EvaluationResults evaluation={evaluation} />}
    </div>
  );
}
