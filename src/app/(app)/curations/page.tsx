"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useCurations, useCreateCuration, useDeleteCuration } from "@/hooks/use-curations";
import { useJds } from "@/hooks/use-jds";
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
  jd_id: z.string().min(1, "Choose a job description"),
  profile_name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
});
type CreateForm = z.infer<typeof createSchema>;

function statusVariant(status: string) {
  if (status === "completed") return "default" as const;
  if (status === "failed" || status === "cancelled") return "destructive" as const;
  return "secondary" as const;
}

/** History of every AI curation job this user has triggered (GET
 * /api/v1/curations/ — flat, tenant-scoped, no JD filter server-side,
 * same shape as builds/evaluations). Triggering a new one here is the
 * entry point into F6: pick a JD, name the resulting draft profile, and
 * POST /api/v1/curations/ — the detail page then shows the live
 * JobActivityFeed while it runs. */
export default function CurationsListPage() {
  const router = useRouter();
  const { data: curations, isLoading, error } = useCurations();
  const { data: jds } = useJds();
  const createCuration = useCreateCuration();
  const deleteCuration = useDeleteCuration();
  const [createOpen, setCreateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const jdTitle = (jdId: string) => jds?.find((j) => j.id === jdId)?.title ?? jdId;

  // Newest first, matching the other job-history lists in the app.
  const ordered = useMemo(
    () =>
      [...(curations ?? [])].sort((a, b) =>
        String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
      ),
    [curations],
  );

  const createButton = (
    <SheetTrigger render={<Button variant="cta" />} data-testid="new-curation-button">
      <Plus aria-hidden="true" />
      Curate a draft profile
    </SheetTrigger>
  );

  return (
    <Sheet open={createOpen} onOpenChange={setCreateOpen}>
      <PageHeader
        title="AI curation"
        description="Let an agent draft a profile tailored to a specific job description, then review it before saving."
        action={createButton}
      />

      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Curate a JD-tailored profile</SheetTitle>
          <SheetDescription>
            An AI agent drafts a new profile tailored to the chosen job description — it spends
            real, capped LLM tokens once picked up by the worker. You review and save it yourself
            before it becomes a real profile.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            // min_score/max_score_gate_attempts/max_turns are optional
            // on the backend (each has a real default — see
            // app/schemas/curation.py's DEFAULT_MIN_SCORE etc.), but
            // openapi-typescript generates CurationCreate with them
            // required (no `?`) since FastAPI's own OpenAPI schema
            // doesn't mark a field with a default as non-required.
            // Passing the same literal defaults explicitly here keeps
            // this a plain, typed object rather than an `as` cast.
            const job = await createCuration.mutateAsync({
              jd_id: values.jd_id,
              profile_name: values.profile_name,
              min_score: 8.5,
              max_score_gate_attempts: 3,
              max_turns: 40,
            });
            setCreateOpen(false);
            router.push(`/curations/${job.id}`);
          })}
          className="mt-4 space-y-4"
        >
          <FormField
            label="Job description"
            htmlFor="curation-jd-select"
            error={errors.jd_id?.message}
            required
          >
            <select
              id="curation-jd-select"
              data-testid="curation-jd-select"
              className="border-border bg-card h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10"
              {...register("jd_id")}
            >
              <option value="">Select a job description…</option>
              {jds?.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.title ?? jd.id}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="New profile name"
            htmlFor="curation-profile-name"
            hint="Lowercase id-like name, unique across your profiles."
            error={errors.profile_name?.message}
            required
          >
            <Input
              id="curation-profile-name"
              placeholder="acme-staff-eng"
              data-testid="curation-profile-name"
              {...register("profile_name")}
            />
          </FormField>

          <ErrorMessage error={createCuration.error} />

          <div className="flex items-center justify-end gap-2 pt-1">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button
              type="submit"
              variant="cta"
              disabled={createCuration.isPending}
              data-testid="create-curation-submit"
            >
              {createCuration.isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
              {createCuration.isPending ? "Starting…" : "Start curation"}
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
          icon={Sparkles}
          title="No curation jobs yet"
          description="Pick a job description and let the agent draft a tailored profile for it."
          action={createButton}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {ordered.map((c) => (
            <Card key={c.id} interactive data-testid={`curation-card-${c.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="truncate">{c.profile_name}</CardTitle>
                  <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {jdTitle(c.jd_id)}
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Button
                  nativeButton={false}
                  render={<Link href={`/curations/${c.id}`} />}
                  variant="outline"
                  size="sm"
                >
                  View
                </Button>
                <ConfirmDeleteButton
                  label={`curation job ${c.profile_name}`}
                  onConfirm={() => deleteCuration.mutate(c.id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ErrorMessage error={deleteCuration.error} />
    </Sheet>
  );
}
