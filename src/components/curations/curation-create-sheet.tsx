"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCuration } from "@/hooks/use-curations";
import { useJds } from "@/hooks/use-jds";
import { newCurationRequest } from "@/lib/domain/curation-defaults";
import { profileNameSchema } from "@/lib/domain/profile-defaults";
import { surfacedElsewhere } from "@/lib/form-submit";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { CreateJobSheet, JOB_SELECT_CLASS } from "@/components/jobs/create-job-sheet";

const createSchema = z.object({
  jd_id: z.string().min(1, "Choose a job description"),
  profile_name: profileNameSchema,
});
type CreateForm = z.infer<typeof createSchema>;

export function CurationCreateSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data: jds } = useJds();
  const createCuration = useCreateCuration();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  return (
    <CreateJobSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel="Curate a draft profile"
      triggerTestId="new-curation-button"
      title="Curate a JD-tailored profile"
      description="An AI agent drafts a new profile tailored to the chosen job description — it spends real, capped LLM tokens once picked up by the worker. You review and save it yourself before it becomes a real profile."
      onSubmit={surfacedElsewhere(
        handleSubmit(async (values) => {
          const job = await createCuration.mutateAsync(newCurationRequest(values));
          onOpenChange(false);
          router.push(`/curations/${job.id}`);
        }),
      )}
      isPending={createCuration.isPending}
      error={createCuration.error}
      idleLabel="Start curation"
      pendingLabel="Starting…"
      submitTestId="create-curation-submit"
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
          className={JOB_SELECT_CLASS}
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
    </CreateJobSheet>
  );
}
