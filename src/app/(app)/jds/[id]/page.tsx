"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { useJd } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { useCreateEvaluation } from "@/hooks/use-evaluations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { SectionHeader } from "@/components/ui/page-header";
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

  const subtitle = jd
    ? [jd.company, jd.source_type === "url" ? "Imported from a URL" : undefined]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="space-y-6">
      <PageToolbar
        className="-mx-4 -mt-5 w-auto px-4 md:-mx-6 md:-mt-6 md:px-6 lg:-mx-8 lg:px-8"
        left={
          <>
            <Link
              href="/jds"
              aria-label="Back to job descriptions"
              className="focus-visible:ring-ring/50 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-[-0.02em] text-slate-900 sm:text-2xl dark:text-slate-50">
                {isLoading ? "Loading…" : (jd?.title ?? "Untitled")}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
              ) : null}
            </div>
            {jd ? <Badge variant="outline">{jd.source_type}</Badge> : null}
          </>
        }
        right={
          jd?.url ? (
            <a
              href={jd.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 underline-offset-4 hover:underline dark:text-slate-400"
            >
              View original posting
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : undefined
        }
      />

      <ErrorMessage error={error} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="space-y-3">
          <SectionHeader
            title="Run an evaluation"
            description="Deterministic metrics are instant and free; the LLM judge spends real, capped tokens."
          />
          <Card size="lg">
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="evaluate-profile-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Profile
                </label>
                <select
                  id="evaluate-profile-select"
                  data-testid="evaluate-profile-select"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-white/10"
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Which tailored resume should be scored against this role?
                </p>
              </div>

              <ErrorMessage error={createEvaluation.error} />

              <Button
                variant="cta"
                disabled={!profileId || createEvaluation.isPending}
                onClick={() => createEvaluation.mutate({ profile_id: profileId, jd_id: jdId })}
                data-testid="run-evaluation-button"
              >
                {createEvaluation.isPending ? (
                  <Loader2 aria-hidden="true" className="animate-spin" />
                ) : (
                  <Sparkles aria-hidden="true" />
                )}
                {createEvaluation.isPending ? "Evaluating…" : "Run evaluation"}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title="Posting text"
            description="The stored text this evaluation reads from."
          />
          {isLoading ? (
            <Card aria-hidden="true">
              <CardContent className="space-y-2.5">
                <div className="bg-muted h-3 w-full animate-pulse rounded-md" />
                <div className="bg-muted h-3 w-11/12 animate-pulse rounded-md" />
                <div className="bg-muted h-3 w-4/5 animate-pulse rounded-md" />
                <div className="bg-muted h-3 w-2/3 animate-pulse rounded-md" />
                <div className="bg-muted h-3 w-10/12 animate-pulse rounded-md" />
              </CardContent>
            </Card>
          ) : jd ? (
            <Card data-testid="jd-detail-card">
              <CardContent>
                <pre className="max-h-[26rem] overflow-auto text-sm leading-6 break-words whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                  {jd.text}
                </pre>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>

      {createEvaluation.data && <EvaluationResults evaluation={createEvaluation.data} />}
    </div>
  );
}
