"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateApplication } from "@/hooks/use-applications";
import { useBuilds } from "@/hooks/use-builds";
import { useProfiles } from "@/hooks/use-profiles";
import { attachableBuilds } from "@/lib/domain/application";
import { blankToUndefined } from "@/lib/domain/text";
import { surfacedElsewhere } from "@/lib/form-submit";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { CreateJobSheet, JOB_SELECT_CLASS } from "@/components/jobs/create-job-sheet";

const createSchema = z.object({
  job_url: z.string().url("Enter a valid job posting URL"),
  // "" (the placeholder option) means "no resume attached" — the worker
  // fills the web form straight from the content record either way; a
  // build is only needed to attach a PDF (see lib/api/applications.ts).
  resume_build_id: z.string(),
});
type CreateForm = z.infer<typeof createSchema>;

export function ApplicationCreateSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data: builds } = useBuilds();
  const { data: profiles } = useProfiles();
  const createApplication = useCreateApplication();
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
  const attachable = attachableBuilds(builds ?? []);

  return (
    <CreateJobSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel="Apply to a job"
      triggerTestId="new-application-button"
      title="Apply to a job posting"
      description="The agent opens the posting in a live browser session you can watch and fills out the form from your content. It never clicks Submit itself — you review the filled form and confirm or cancel yourself, inside that same session."
      onSubmit={surfacedElsewhere(
        handleSubmit(async (values) => {
          const job = await createApplication.mutateAsync({
            job_url: values.job_url,
            resume_build_id: blankToUndefined(values.resume_build_id),
          });
          onOpenChange(false);
          router.push(`/applications/${job.id}`);
        }),
      )}
      isPending={createApplication.isPending}
      error={createApplication.error}
      idleLabel="Start applying"
      pendingLabel="Starting…"
      submitTestId="create-application-submit"
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
          attachable.length === 0
            ? "No completed builds yet — export one from a profile first, or continue without attaching one."
            : "Optional — the agent fills the form from your content either way."
        }
      >
        <select
          id="application-resume-build"
          data-testid="application-resume-build"
          className={JOB_SELECT_CLASS}
          {...register("resume_build_id")}
        >
          <option value="">No resume attached</option>
          {attachable.map((b) => (
            <option key={b.id} value={b.id}>
              {profileLabel(b.profile_id)} · {b.page_count ?? "?"}p ·{" "}
              {new Date(b.created_at).toLocaleDateString()}
            </option>
          ))}
        </select>
      </FormField>
    </CreateJobSheet>
  );
}
