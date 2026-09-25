"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink, Loader2, Plus, SendHorizontal } from "lucide-react";
import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
} from "@/hooks/use-applications";
import { useBuilds } from "@/hooks/use-builds";
import { useProfiles } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";

const createSchema = z.object({
  job_url: z.string().url("Enter a valid job posting URL"),
  // "" (the placeholder option) means "no resume attached" — the worker
  // fills the web form straight from the content record either way; a
  // build is only needed to attach a PDF (see lib/api/applications.ts).
  resume_build_id: z.string(),
});
type CreateForm = z.infer<typeof createSchema>;

const TERMINAL_STATUSES = new Set(["submitted", "cancelled", "failed", "expired"]);

function statusVariant(status: string) {
  if (status === "submitted") return "default" as const;
  if (status === "failed" || status === "cancelled" || status === "expired") {
    return "destructive" as const;
  }
  return "secondary" as const;
}

function jobDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** History of every apply job this user has triggered (GET
 * /api/v1/applications/ — flat, tenant-scoped, same shape as
 * builds/evaluations/curations). Triggering a new one here is the entry
 * point into F7: point the agent at a job posting, optionally attach a
 * resume PDF, and POST /api/v1/applications/ — the detail page then shows
 * the live browser session (once one exists) and F6's shared
 * JobActivityFeed while it runs. */
export default function ApplicationsListPage() {
  const router = useRouter();
  const { data: applications, isLoading, error } = useApplications();
  const { data: builds } = useBuilds();
  const { data: profiles } = useProfiles();
  const createApplication = useCreateApplication();
  const deleteApplication = useDeleteApplication();
  const [createOpen, setCreateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { job_url: "", resume_build_id: "" },
  });

  const profileLabel = (profileId: string) =>
    profiles?.find((p) => p.id === profileId)?.label ?? profileId;

  // Only a completed build has a usable pdf_url — a failed one can't be
  // attached, so it's left out of the picker entirely rather than shown
  // disabled (there's nothing a user could do to make a failed build
  // selectable from here).
  const attachableBuilds = useMemo(
    () => (builds ?? []).filter((b) => b.status === "completed"),
    [builds],
  );

  const ordered = useMemo(
    () =>
      [...(applications ?? [])].sort((a, b) =>
        String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
      ),
    [applications],
  );

  const createButton = (
    <SheetTrigger render={<Button variant="cta" />} data-testid="new-application-button">
      <Plus aria-hidden="true" />
      Apply to a job
    </SheetTrigger>
  );

  return (
    <Sheet open={createOpen} onOpenChange={setCreateOpen}>
      <PageHeader
        title="Apply"
        description="Point the agent at a job posting and watch it fill out the application live, in a browser you can see."
        action={createButton}
      />

      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Apply to a job posting</SheetTitle>
          <SheetDescription>
            The agent opens the posting in a live browser session you can watch and fills out the
            form from your content. It never clicks Submit itself — you review the filled form and
            confirm or cancel yourself, inside that same session.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            const job = await createApplication.mutateAsync({
              job_url: values.job_url,
              resume_build_id: values.resume_build_id ? values.resume_build_id : undefined,
            });
            setCreateOpen(false);
            router.push(`/applications/${job.id}`);
          })}
          className="mt-4 space-y-4"
        >
          <FormField
            label="Job posting URL"
            htmlFor="application-job-url"
            error={errors.job_url?.message}
            required
          >
            <Input
              id="application-job-url"
              type="url"
              placeholder="https://jobs.example.com/staff-engineer"
              data-testid="application-job-url"
              {...register("job_url")}
            />
          </FormField>

          <FormField
            label="Attach a resume"
            htmlFor="application-resume-build"
            hint={
              attachableBuilds.length === 0
                ? "No completed builds yet — export one from a profile first, or continue without attaching one."
                : "Optional — the agent fills the form from your content either way."
            }
          >
            <select
              id="application-resume-build"
              data-testid="application-resume-build"
              className="border-border bg-card h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10"
              {...register("resume_build_id")}
            >
              <option value="">No resume attached</option>
              {attachableBuilds.map((b) => (
                <option key={b.id} value={b.id}>
                  {profileLabel(b.profile_id)} · {b.page_count ?? "?"}p ·{" "}
                  {new Date(b.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </FormField>

          <ErrorMessage error={createApplication.error} />

          <div className="flex items-center justify-end gap-2 pt-1">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button
              type="submit"
              variant="cta"
              disabled={createApplication.isPending}
              data-testid="create-application-submit"
            >
              {createApplication.isPending && (
                <Loader2 aria-hidden="true" className="animate-spin" />
              )}
              {createApplication.isPending ? "Starting…" : "Start applying"}
            </Button>
          </div>
        </form>
      </SheetContent>

      <ErrorMessage error={error} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <EmptyState
          icon={SendHorizontal}
          title="No applications yet"
          description="Point the agent at a job posting and watch it fill out the form for you."
          action={createButton}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {ordered.map((a) => (
            <Card key={a.id} interactive data-testid={`application-card-${a.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="truncate">{jobDomain(a.job_url)}</CardTitle>
                  <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                </div>
                <a
                  href={a.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 truncate text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                  <span className="truncate">{a.job_url}</span>
                </a>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Button
                  nativeButton={false}
                  render={<Link href={`/applications/${a.id}`} />}
                  variant="outline"
                  size="sm"
                >
                  {TERMINAL_STATUSES.has(a.status) ? "View" : "Watch live"}
                </Button>
                <ConfirmDeleteButton
                  label={`application to ${jobDomain(a.job_url)}`}
                  onConfirm={() => deleteApplication.mutate(a.id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ErrorMessage error={deleteApplication.error} />
    </Sheet>
  );
}
