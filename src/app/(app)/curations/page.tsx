"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useCurations, useCreateCuration, useDeleteCuration } from "@/hooks/use-curations";
import { useJds } from "@/hooks/use-jds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const jdTitle = (jdId: string) => jds?.find((j) => j.id === jdId)?.title ?? jdId;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">AI curation</h1>
        <Button onClick={() => setShowCreateForm((v) => !v)} data-testid="new-curation-button">
          <Plus /> Curate a draft profile
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Curate a JD-tailored profile</CardTitle>
            <CardDescription>
              An AI agent drafts a new profile tailored to the chosen job description — spends
              real, capped LLM tokens once picked up by the worker. You review and save it
              yourself before it&apos;s a real profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                router.push(`/curations/${job.id}`);
              })}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="curation-jd-select">Job description</Label>
                <select
                  id="curation-jd-select"
                  data-testid="curation-jd-select"
                  className="border-border bg-background h-8 rounded-lg border px-2 text-sm"
                  {...register("jd_id")}
                >
                  <option value="">Select a job description…</option>
                  {jds?.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.title ?? jd.id}
                    </option>
                  ))}
                </select>
                {errors.jd_id && <p className="text-destructive text-xs">{errors.jd_id.message}</p>}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="curation-profile-name">New profile name (id-like, unique)</Label>
                <Input
                  id="curation-profile-name"
                  placeholder="acme-staff-eng"
                  data-testid="curation-profile-name"
                  {...register("profile_name")}
                />
                {errors.profile_name && (
                  <p className="text-destructive text-xs">{errors.profile_name.message}</p>
                )}
              </div>
              <Button type="submit" disabled={createCuration.isPending} data-testid="create-curation-submit">
                {createCuration.isPending ? "Starting…" : "Start curation"}
              </Button>
            </form>
            <ErrorMessage error={createCuration.error} />
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-muted-foreground text-sm">Loading curation jobs…</p>}
      <ErrorMessage error={error} />

      {curations?.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm">
          No curation jobs yet — pick a job description and let the agent draft a profile for it.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {curations?.map((c) => (
          <Card key={c.id} data-testid={`curation-card-${c.id}`}>
            <CardHeader>
              <CardTitle>{c.profile_name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{jdTitle(c.jd_id)}</span>
                <Badge
                  variant={
                    c.status === "completed"
                      ? "default"
                      : c.status === "failed" || c.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {c.status}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <Button nativeButton={false} render={<Link href={`/curations/${c.id}`} />} size="sm">
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
    </div>
  );
}
