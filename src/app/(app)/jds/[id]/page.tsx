"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { useJd } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { useCreateEvaluation } from "@/hooks/use-evaluations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { FormField } from "@/components/ui/form-field";
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
  const jdId = params.id;
  const { data: jd, isLoading, error } = useJd(jdId);
  const { data: profiles } = useProfiles();
  const createEvaluation = useCreateEvaluation();
  const [profileId, setProfileId] = useState("");

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/jds"
        eyebrow="Job description"
        title={isLoading ? "Loading…" : (jd?.title ?? "Untitled")}
        description={
          jd
            ? [jd.company, jd.source_type === "url" ? "Imported from a URL" : undefined]
                .filter(Boolean)
                .join(" · ") || undefined
            : undefined
        }
      >
        {jd && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Badge variant="outline">{jd.source_type}</Badge>
            {jd.url && (
              <a
                href={jd.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 underline-offset-4 hover:underline dark:text-slate-400"
              >
                View original posting
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            )}
          </div>
        )}
      </PageHeader>

      <ErrorMessage error={error} />

      {isLoading && (
        <Card aria-hidden="true">
          <CardContent className="space-y-3">
            <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-11/12 animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-4/5 animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-2/3 animate-pulse rounded-md" />
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <SectionHeader
          title="Run an evaluation"
          description="Deterministic metrics are instant and free; the LLM judge spends real, capped tokens."
        />
        <Card>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:max-w-md">
              <FormField
                label="Profile"
                htmlFor="evaluate-profile-select"
                hint="Which tailored resume should be scored against this role?"
              >
                <select
                  id="evaluate-profile-select"
                  data-testid="evaluate-profile-select"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 transition-all outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:bg-slate-900"
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
              </FormField>
            </div>

            <ErrorMessage error={createEvaluation.error} />

            <Button
              variant="cta"
              disabled={!profileId || createEvaluation.isPending}
              onClick={() => createEvaluation.mutate({ profile_id: profileId, jd_id: jdId })}
              data-testid="run-evaluation-button"
            >
              <Sparkles aria-hidden="true" />
              {createEvaluation.isPending ? "Evaluating…" : "Run evaluation"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {createEvaluation.data && <EvaluationResults evaluation={createEvaluation.data} />}

      {jd && (
        <section className="space-y-4">
          <SectionHeader
            title="Posting text"
            description="The stored text this evaluation reads from."
          />
          <Card data-testid="jd-detail-card">
            <CardContent>
              <pre className="max-h-96 overflow-auto text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                {jd.text}
              </pre>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
