"use client";

import Link from "next/link";
import { ClipboardCheck, Search } from "lucide-react";
import { useEvaluations } from "@/hooks/use-evaluations";
import { useEvaluationListView } from "@/hooks/use-evaluation-list-view";
import { useJds } from "@/hooks/use-jds";
import { useProfiles } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/content/error-message";
import { EvaluationCard, EvaluationCardSkeleton } from "@/components/evaluations/evaluation-card";
import { EvaluationListToolbar } from "@/components/evaluations/evaluation-list-toolbar";

const GRID_CLASS =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

/** Flat history of every evaluation this user has run (GET
 * /api/v1/evaluations/ has no profile/JD filter server-side). Profile/JD
 * names are joined in client-side from the already-fetched lists. */
export default function EvaluationsListPage() {
  const { data: evaluations, isLoading, error } = useEvaluations();
  const { data: jds } = useJds();
  const { data: profiles } = useProfiles();
  const view = useEvaluationListView(evaluations, profiles, jds);

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

      {view.rows.length > 0 ? (
        <EvaluationListToolbar
          query={view.query}
          rows={view.rows}
          statuses={view.statuses}
          visibleCount={view.visible.length}
          onSearchChange={view.setSearch}
          onSortChange={view.setSort}
          onStatusChange={view.setStatus}
        />
      ) : null}

      {isLoading ? (
        <div className={GRID_CLASS}>
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
      ) : view.visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No evaluations match those filters"
          description="Try a different search term or switch back to all statuses."
          action={
            <Button variant="outline" onClick={view.clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className={GRID_CLASS}>
          {view.visible.map((e) => (
            <EvaluationCard key={e.id} evaluation={e} />
          ))}
        </div>
      )}
    </div>
  );
}
