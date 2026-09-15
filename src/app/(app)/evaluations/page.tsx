"use client";

import Link from "next/link";
import { useEvaluations } from "@/hooks/use-evaluations";
import { useJds } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/content/error-message";

/** Flat history of every evaluation this user has run (GET
 * /api/v1/evaluations/ has no profile/JD filter server-side, same as
 * builds — see use-evaluations.ts). Profile/JD names are joined in
 * client-side from the already-fetched lists rather than added to the
 * summary response. */
export default function EvaluationsListPage() {
  const { data: evaluations, isLoading, error } = useEvaluations();
  const { data: jds } = useJds();
  const { data: profiles } = useProfiles();

  const jdTitle = (jdId: string) => jds?.find((j) => j.id === jdId)?.title ?? jdId;
  const profileLabel = (profileId: string) =>
    profiles?.find((p) => p.id === profileId)?.label ?? profileId;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Evaluations</h1>
        <Button nativeButton={false} render={<Link href="/jds" />} variant="outline" size="sm">
          Run a new evaluation
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading evaluations…</p>}
      <ErrorMessage error={error} />

      {evaluations?.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm">
          No evaluations yet — open a job description and run one against a profile.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {evaluations?.map((e) => (
          <Card key={e.id} data-testid={`evaluation-card-${e.id}`}>
            <CardHeader>
              <CardTitle>{profileLabel(e.profile_id)}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{jdTitle(e.jd_id)}</span>
                <Badge variant={e.status === "completed" ? "default" : e.status === "failed" ? "destructive" : "secondary"}>
                  {e.status}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">
                {e.overall_score != null ? `${e.overall_score}/10` : "—"}
              </span>
              <Button nativeButton={false} render={<Link href={`/evaluations/${e.id}`} />} size="sm">
                View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
