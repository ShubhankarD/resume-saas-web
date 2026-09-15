"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { useEvaluations } from "@/hooks/use-evaluations";
import { useJds } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/content/error-message";

/** Flat history of every evaluation this user has run (GET
 * /api/v1/evaluations/ has no profile/JD filter server-side, same as
 * builds — see use-evaluations.ts). Profile/JD names are joined in
 * client-side from the already-fetched lists rather than added to the
 * summary response. */
function statusVariant(status: string): "default" | "secondary" | "destructive" {
  if (status === "completed") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
}

function EvaluationCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-4">
        <div className="bg-muted h-5 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-20 animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  );
}

export default function EvaluationsListPage() {
  const { data: evaluations, isLoading, error } = useEvaluations();
  const { data: jds } = useJds();
  const { data: profiles } = useProfiles();

  const jdTitle = (jdId: string) => jds?.find((j) => j.id === jdId)?.title ?? jdId;
  const profileLabel = (profileId: string) =>
    profiles?.find((p) => p.id === profileId)?.label ?? profileId;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Feedback"
        title="Evaluations"
        description="Every time you scored a profile against a job description, with its fit scores and coverage gaps."
        action={
          <Button variant="cta" nativeButton={false} render={<Link href="/jds" />}>
            Run a new evaluation
          </Button>
        }
      />

      <ErrorMessage error={error} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EvaluationCardSkeleton />
          <EvaluationCardSkeleton />
          <EvaluationCardSkeleton />
        </div>
      ) : evaluations?.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No evaluations yet"
          description="Open a job description and run a profile against it to see fit scores, requirement coverage, and concrete gaps."
          action={
            <Button variant="cta" nativeButton={false} render={<Link href="/jds" />}>
              Choose a job description
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evaluations?.map((e) => (
            <Card key={e.id} data-testid={`evaluation-card-${e.id}`} className="h-full">
              <CardContent className="flex h-full flex-col gap-5">
                <div className="min-w-0 space-y-2">
                  <h2 className="font-heading truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                    {profileLabel(e.profile_id)}
                  </h2>
                  <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                    vs. {jdTitle(e.jd_id)}
                  </p>
                  <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                      Overall
                    </p>
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
                      {e.overall_score != null ? (
                        <>
                          {e.overall_score}
                          <span className="text-base font-semibold text-slate-400">/10</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <Button
                    nativeButton={false}
                    render={<Link href={`/evaluations/${e.id}`} />}
                    size="sm"
                    variant="outline"
                  >
                    View
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
