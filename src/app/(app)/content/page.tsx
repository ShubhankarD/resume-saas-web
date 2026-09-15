"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, FileUp, GraduationCap, ListChecks, Repeat2, Wrench } from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { putContent } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";
import { ContentSkeleton } from "@/components/content/content-states";

const scratchSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});
type ScratchForm = z.infer<typeof scratchSchema>;

export default function ContentOverviewPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const [showScratchForm, setShowScratchForm] = useState(false);
  const nameFieldId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScratchForm>({ resolver: zodResolver(scratchSchema) });

  const scratchMutation = useMutation({
    mutationFn: (name: string) =>
      putContent({
        name,
        contact: [],
        taglines: {},
        skills: {},
        experience: [],
        education: [],
        application: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      setShowScratchForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Content library" title="Your resume content" />
        <ContentSkeleton rows={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Content library" title="Your resume content" />
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Content library"
          title="Let's build your resume content"
          description="Your content library is the single source of truth every tailored resume is generated from. Pick a starting point — you can change everything later."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StartOption
            href="/content/intake"
            icon={FileUp}
            title="Upload a resume"
            description="We extract a draft from a PDF or DOCX for you to review."
          />
          <StartOption
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
            className="focus-visible:ring-ring/50 rounded-2xl border border-slate-200/80 bg-white p-6 text-left transition-colors duration-150 outline-none hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
          >
            <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <ListChecks aria-hidden="true" className="size-5" />
            </span>
            <span className="block text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Start from scratch
            </span>
            <span className="mt-1.5 block text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Create an empty record and add roles as you go.
            </span>
          </button>
        </div>

        {showScratchForm && (
          <Card className="p-6 sm:p-8">
            <form
              onSubmit={handleSubmit((values) => scratchMutation.mutate(values.name))}
              className="space-y-5"
            >
              <SectionHeader
                title="Start from scratch"
                description="We only need your name to create the record."
              />
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
              <ErrorMessage error={scratchMutation.error} />
              <Button
                type="submit"
                variant="cta"
                disabled={scratchMutation.isPending}
                data-testid="create-empty-content"
              >
                {scratchMutation.isPending ? "Creating…" : "Create empty content record"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    );
  }

  const roleCount = content.experience.length;
  const bulletCount = content.experience.reduce(
    (sum, role) => sum + role.groups.reduce((s, g) => s + g.bullets.length, 0),
    0,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content library"
        title="Your resume content"
        description="Everything your tailored resumes are built from, in one place."
        action={
          <Button nativeButton={false} variant="cta" render={<Link href="/content/experience" />}>
            Edit experience
          </Button>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Resume name:{" "}
          <span
            data-testid="content-name"
            className="font-semibold text-slate-900 dark:text-slate-100"
          >
            {content.name}
          </span>
        </p>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryStat label="Roles" value={roleCount} href="/content/experience" icon={Briefcase} />
        <SummaryStat
          label="Bullets"
          value={bulletCount}
          href="/content/experience"
          icon={ListChecks}
        />
        <SummaryStat
          label="Skill groups"
          value={Object.keys(content.skills).length}
          href="/content/skills"
          icon={Wrench}
        />
        <SummaryStat
          label="Education"
          value={content.education.length}
          href="/content/education"
          icon={GraduationCap}
        />
      </div>
    </div>
  );
}

function StartOption({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring/50 rounded-2xl border border-slate-200/80 bg-white p-6 transition-colors duration-150 outline-none hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
    >
      <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="block text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </span>
      <span className="mt-1.5 block text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {description}
      </span>
    </Link>
  );
}

function SummaryStat({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring/50 rounded-2xl border border-slate-200/80 bg-white p-5 transition-colors duration-150 outline-none hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-3 sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
    >
      <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        <Icon aria-hidden className="size-3.5" />
        {label}
      </span>
      <span className="mt-2 block text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
        {value}
      </span>
    </Link>
  );
}
