"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileUp, ListChecks, Repeat2 } from "lucide-react";
import { useReplaceContent } from "@/hooks/use-content";
import { emptyContent } from "@/lib/domain/content-overview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/content/error-message";
import { IconRowBody, SectionOverline, StartOptionRow } from "@/components/content/overview-parts";

const scratchSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});
type ScratchValues = z.infer<typeof scratchSchema>;

/** Shown when the user has no content record yet: three ways to begin. */
export function StartLibrary() {
  const [showScratchForm, setShowScratchForm] = useState(false);

  return (
    <>
      <section className="space-y-3">
        <SectionOverline label="Start your library" />
        <div className="space-y-2">
          <StartOptionRow
            href="/content/intake"
            icon={FileUp}
            title="Upload a resume"
            description="We extract a draft from a PDF or DOCX for you to review."
          />
          <StartOptionRow
            href="/content/import"
            icon={Repeat2}
            title="Import content.yaml"
            description="Already have a structured file? Bring it straight in."
          />
          <button
            type="button"
            onClick={() => setShowScratchForm((v) => !v)}
            aria-expanded={showScratchForm}
            data-testid="start-from-scratch"
            className="focus-visible:ring-ring/50 flex w-full min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-colors duration-150 outline-none hover:border-slate-300 focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <IconRowBody
              icon={ListChecks}
              tone="accent"
              title="Start from scratch"
              description="Create an empty record and add roles as you go."
            />
          </button>
        </div>
      </section>

      {showScratchForm && <ScratchForm onCreated={() => setShowScratchForm(false)} />}
    </>
  );
}

function ScratchForm({ onCreated }: { onCreated: () => void }) {
  const nameFieldId = useId();
  const createContent = useReplaceContent();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScratchValues>({ resolver: zodResolver(scratchSchema) });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        createContent.mutate(emptyContent(values.name), { onSuccess: onCreated }),
      )}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <SectionOverline label="Start from scratch" />
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          We only need your name to create the record.
        </p>
      </div>
      <FormField
        label="Your name"
        htmlFor={nameFieldId}
        error={errors.name?.message}
        required
        className="max-w-md"
      >
        <Input
          id={nameFieldId}
          placeholder="Jane Doe"
          aria-invalid={errors.name ? true : undefined}
          {...register("name")}
        />
      </FormField>
      <ErrorMessage error={createContent.error} />
      <Button
        type="submit"
        variant="cta"
        disabled={createContent.isPending}
        data-testid="create-empty-content"
      >
        {createContent.isPending ? "Creating…" : "Create empty content record"}
      </Button>
    </form>
  );
}
