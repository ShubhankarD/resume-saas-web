"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ClipboardCheck, Search } from "lucide-react";
import { useEvaluations } from "@/hooks/use-evaluations";
import { useJds } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { CompactTabs } from "@/components/ui/compact-tabs";
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EvaluationCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-3">
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/3 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-20 animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}

type EvalSort = "newest" | "oldest" | "score";

const EVAL_SORT_LABELS: Record<EvalSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  score: "Highest score",
};

export default function EvaluationsListPage() {
  const { data: evaluations, isLoading, error } = useEvaluations();
  const { data: jds } = useJds();
  const { data: profiles } = useProfiles();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<EvalSort>("newest");

  const jdTitle = (jdId: string) => jds?.find((j) => j.id === jdId)?.title ?? jdId;
  const profileLabel = (profileId: string) =>
    profiles?.find((p) => p.id === profileId)?.label ?? profileId;

  const statuses = useMemo(
    () => Array.from(new Set((evaluations ?? []).map((e) => e.status))).sort(),
    [evaluations],
  );

  // Purely client-side over what `useEvaluations()` already returned — the
  // list endpoint accepts no filter or sort parameters.
  const visibleEvaluations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = (evaluations ?? []).filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (!needle) return true;
      const label = profiles?.find((p) => p.id === e.profile_id)?.label ?? e.profile_id;
      const title = jds?.find((j) => j.id === e.jd_id)?.title ?? e.jd_id;
      return label.toLowerCase().includes(needle) || title.toLowerCase().includes(needle);
    });
    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "score") return (b.overall_score ?? -1) - (a.overall_score ?? -1);
      return b.created_at.localeCompare(a.created_at);
    });
  }, [evaluations, jds, profiles, query, status, sort]);

  const hasEvaluations = (evaluations?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="Evaluations"
        description="Every profile you scored against a job description, with fit and coverage."
        action={
          <Button variant="cta" nativeButton={false} render={<Link href="/jds" />}>
            Run a new evaluation
          </Button>
        }
      />

      <ErrorMessage error={error} />

      {hasEvaluations ? (
        <PageToolbar
          className="rounded-lg border px-3 py-2 md:px-4"
          left={
            <>
              <div className="relative w-full sm:w-72">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="search"
                  aria-label="Search evaluations"
                  placeholder="Search profile or role…"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {statuses.length > 1 ? (
                <CompactTabs
                  aria-label="Filter by status"
                  value={status}
                  onValueChange={setStatus}
                  items={[
                    { value: "all", label: "All", badge: evaluations?.length },
                    ...statuses.map((s) => ({
                      value: s,
                      label: s,
                      badge: evaluations?.filter((e) => e.status === s).length,
                    })),
                  ]}
                />
              ) : null}
            </>
          }
          right={
            <>
              <label htmlFor="evaluations-sort" className="sr-only">
                Sort evaluations
              </label>
              <select
                id="evaluations-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as EvalSort)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-white/10"
              >
                {(Object.keys(EVAL_SORT_LABELS) as EvalSort[]).map((key) => (
                  <option key={key} value={key}>
                    {EVAL_SORT_LABELS[key]}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                {visibleEvaluations.length} of {evaluations?.length ?? 0}
              </span>
            </>
          }
        />
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <EvaluationCardSkeleton />
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
      ) : visibleEvaluations.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No evaluations match those filters"
          description="Try a different search term or switch back to all statuses."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visibleEvaluations.map((e) => (
            <Card key={e.id} data-testid={`evaluation-card-${e.id}`} interactive className="h-full">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
                      {profileLabel(e.profile_id)}
                    </h2>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      vs. {jdTitle(e.jd_id)}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-semibold text-slate-900 tabular-nums dark:text-slate-50">
                    {e.overall_score != null ? (
                      <>
                        {e.overall_score}
                        <span className="text-xs font-medium text-slate-400">/10</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                  {e.coverage_score != null ? (
                    <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      Coverage {e.coverage_score}/10
                    </span>
                  ) : null}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(e.created_at)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-end">
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
