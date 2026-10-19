"use client";

import { useState } from "react";
import { Plus, SendHorizontal } from "lucide-react";
import { useApplications, useDeleteApplication } from "@/hooks/use-applications";
import { newestFirst } from "@/lib/domain/dates";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/content/error-message";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplicationCreateSheet } from "@/components/applications/application-create-sheet";
import { JOB_GRID_CLASS, JobGridSkeleton } from "@/components/jobs/job-grid";

/** History of every apply job this user has triggered (GET
 * /api/v1/applications/ — flat, tenant-scoped, same shape as
 * builds/evaluations/curations). Triggering a new one here is the entry
 * point into F7: point the agent at a job posting, optionally attach a
 * resume PDF, and POST /api/v1/applications/ — the detail page then shows
 * the live browser session (once one exists) and F6's shared
 * JobActivityFeed while it runs. */
export default function ApplicationsListPage() {
  const { data: applications, isLoading, error } = useApplications();
  const deleteApplication = useDeleteApplication();
  const [createOpen, setCreateOpen] = useState(false);

  const ordered = newestFirst(applications ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply"
        description="Point the agent at a job posting and watch it fill out the application live, in a browser you can see."
        action={<ApplicationCreateSheet open={createOpen} onOpenChange={setCreateOpen} />}
      />

      <ErrorMessage error={error} />

      {isLoading ? (
        <JobGridSkeleton />
      ) : ordered.length === 0 ? (
        <EmptyState
          icon={SendHorizontal}
          title="No applications yet"
          description="Point the agent at a job posting and watch it fill out the form for you."
          action={
            <Button variant="cta" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              Apply to a job
            </Button>
          }
        />
      ) : (
        <div className={JOB_GRID_CLASS}>
          {ordered.map((a) => (
            <ApplicationCard
              key={a.id}
              application={a}
              onDelete={(id) => deleteApplication.mutate(id)}
            />
          ))}
        </div>
      )}

      <ErrorMessage error={deleteApplication.error} />
    </div>
  );
}
