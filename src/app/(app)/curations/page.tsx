"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useCurations, useDeleteCuration } from "@/hooks/use-curations";
import { useJds } from "@/hooks/use-jds";
import { newestFirst } from "@/lib/domain/dates";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/content/error-message";
import { CurationCard } from "@/components/curations/curation-card";
import { CurationCreateSheet } from "@/components/curations/curation-create-sheet";
import { JOB_GRID_CLASS, JobGridSkeleton } from "@/components/jobs/job-grid";

/** History of every AI curation job this user has triggered (GET
 * /api/v1/curations/ — flat, tenant-scoped, no JD filter server-side,
 * same shape as builds/evaluations). Triggering a new one here is the
 * entry point into F6: pick a JD, name the resulting draft profile, and
 * POST /api/v1/curations/ — the detail page then shows the live
 * JobActivityFeed while it runs. */
export default function CurationsListPage() {
  const { data: curations, isLoading, error } = useCurations();
  const { data: jds } = useJds();
  const deleteCuration = useDeleteCuration();
  const [createOpen, setCreateOpen] = useState(false);

  const jdTitle = (jdId: string) => jds?.find((j) => j.id === jdId)?.title ?? jdId;
  const ordered = newestFirst(curations ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI curation"
        description="Let an agent draft a profile tailored to a specific job description, then review it before saving."
        action={<CurationCreateSheet open={createOpen} onOpenChange={setCreateOpen} />}
      />

      <ErrorMessage error={error} />

      {isLoading ? (
        <JobGridSkeleton />
      ) : ordered.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No curation jobs yet"
          description="Pick a job description and let the agent draft a tailored profile for it."
          action={
            <Button variant="cta" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              Curate a draft profile
            </Button>
          }
        />
      ) : (
        <div className={JOB_GRID_CLASS}>
          {ordered.map((c) => (
            <CurationCard
              key={c.id}
              curation={c}
              jdTitle={jdTitle(c.jd_id)}
              onDelete={(id) => deleteCuration.mutate(id)}
            />
          ))}
        </div>
      )}

      <ErrorMessage error={deleteCuration.error} />
    </div>
  );
}
