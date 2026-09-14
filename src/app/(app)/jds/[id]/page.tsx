"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useJd } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { useCreateEvaluation } from "@/hooks/use-evaluations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/content/error-message";
import { EvaluationResults } from "@/components/evaluations/evaluation-results";

/**
 * JD detail: shows the stored JD text plus a "pick a profile, run an
 * evaluation" flow. `POST /api/v1/evaluations/` is synchronous on the
 * backend (see lib/api/evaluations.ts's docstring) — it runs both the
 * deterministic metrics and the real LLM-judge call inline and returns the
 * finished row directly, so this page just awaits the mutation and renders
 * whatever comes back (`status: 'completed'` with `llm_report` populated,
 * or `status: 'failed'` with `error_message` set — e.g. a missing
 * GEMINI_API_KEY on the backend surfaces here as a failed row, not a
 * thrown request error, per `tracked_job()`'s swallow-and-record
 * behavior).
 */
export default function JdDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jdId = params.id;
  const { data: jd, isLoading, error } = useJd(jdId);
  const { data: profiles } = useProfiles();
  const createEvaluation = useCreateEvaluation();
  const [profileId, setProfileId] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Job description</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/jds")}>
          Back to list
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      <ErrorMessage error={error} />

      {jd && (
        <Card data-testid="jd-detail-card">
          <CardHeader>
            <CardTitle>{jd.title ?? "Untitled"}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {jd.company && <span>{jd.company}</span>}
              <Badge variant="outline">{jd.source_type}</Badge>
              {jd.url && (
                <a
                  href={jd.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground underline"
                >
                  source
                </a>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-muted-foreground max-h-64 overflow-auto whitespace-pre-wrap text-xs">
              {jd.text}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Evaluate a profile against this job description</CardTitle>
          <CardDescription>
            Runs deterministic metrics ($0, instant) and an LLM-judge call (spends real, capped
            tokens) against the backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 sm:w-64">
            <Label htmlFor="evaluate-profile-select">Profile</Label>
            <select
              id="evaluate-profile-select"
              data-testid="evaluate-profile-select"
              className="border-border bg-background h-8 rounded-lg border px-2 text-sm"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
            >
              <option value="">Select a profile…</option>
              {profiles?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.name})
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={!profileId || createEvaluation.isPending}
            onClick={() => createEvaluation.mutate({ profile_id: profileId, jd_id: jdId })}
            className="self-start"
            data-testid="run-evaluation-button"
          >
            {createEvaluation.isPending ? "Evaluating…" : "Run evaluation"}
          </Button>
          <ErrorMessage error={createEvaluation.error} />
        </CardContent>
      </Card>

      {createEvaluation.data && <EvaluationResults evaluation={createEvaluation.data} />}
    </div>
  );
}
