"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  ChevronRight,
  FileUp,
  ListChecks,
  Plus,
  Repeat2,
  type LucideIcon,
} from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { putContent } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";
import { ContentSkeleton } from "@/components/content/content-states";

const scratchSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});
type ScratchForm = z.infer<typeof scratchSchema>;

/** The four sections a resume can actually draw from. "Completeness" here is
 * deliberately literal — how many of them hold at least one entry — so the
 * number never implies a quality judgement the app cannot make. */
const TRACKED_SECTIONS = 4;

/** How many rows each overview section previews before linking to its editor. */
const PREVIEW_ROWS = 3;

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
      <div className="space-y-6">
        <PageHeader eyebrow="Content library" title="Content library" />
        <ContentSkeleton rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Content library" title="Content library" />
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Content library"
          title="Content library"
          description="Your library is the single source of truth every tailored resume is generated from. Pick a starting point — nothing here is permanent."
        />

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
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <ListChecks aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Start from scratch
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                  Create an empty record and add roles as you go.
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-slate-400 dark:text-slate-500"
              />
            </button>
          </div>
        </section>

        {showScratchForm && (
          <form
            onSubmit={handleSubmit((values) => scratchMutation.mutate(values.name))}
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
        )}
      </div>
    );
  }

  const roleCount = content.experience.length;
  const bulletCount = content.experience.reduce(
    (sum, role) => sum + role.groups.reduce((s, g) => s + g.bullets.length, 0),
    0,
  );
  const skillEntries = Object.entries(content.skills);
  const taglineEntries = Object.entries(content.taglines);
  const educationEntries = content.education;

  const sectionsWithContent = [
    roleCount,
    educationEntries.length,
    skillEntries.length,
    taglineEntries.length,
  ].filter((n) => n > 0).length;
  const completeness = Math.round((sectionsWithContent / TRACKED_SECTIONS) * 100);
  const totalEntries =
    roleCount + bulletCount + skillEntries.length + taglineEntries.length + educationEntries.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content library"
        title="Content library"
        description="Manage the reusable content every tailored resume is built from."
        action={
          <Button nativeButton={false} variant="cta" render={<Link href="/content/experience" />}>
            <Plus aria-hidden="true" className="size-4" />
            Add role
          </Button>
        }
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Resume name:{" "}
          <span
            data-testid="content-name"
            className="font-semibold text-slate-900 dark:text-slate-100"
          >
            {content.name}
          </span>
        </p>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard
          label="Section coverage"
          value={`${completeness}%`}
          progress={completeness}
          hint={`${sectionsWithContent} of ${TRACKED_SECTIONS} sections have content`}
          icon={ListChecks}
        />
        <MetricCard
          label="Content entries"
          value={totalEntries}
          hint={`${roleCount} roles · ${bulletCount} bullets · ${skillEntries.length} skill groups`}
          icon={Briefcase}
        />
      </div>

      <OverviewSection
        label="Experience"
        href="/content/experience"
        addLabel="Add role"
        total={roleCount}
        emptyLabel="Add your first role"
      >
        {content.experience.slice(0, PREVIEW_ROWS).map((role) => (
          <OverviewRow
            key={role.id}
            href="/content/experience"
            title={role.title || "Untitled role"}
            meta={[role.org, role.dates].filter(Boolean).join(" · ")}
          />
        ))}
      </OverviewSection>

      <OverviewSection
        label="Education"
        href="/content/education"
        addLabel="Add entry"
        total={educationEntries.length}
        emptyLabel="Add a degree or certification"
      >
        {educationEntries.slice(0, PREVIEW_ROWS).map((entry) => (
          <OverviewRow
            key={entry.id}
            href="/content/education"
            title={entry.text}
            meta={entry.id}
          />
        ))}
      </OverviewSection>

      <OverviewSection
        label="Skills"
        href="/content/skills"
        addLabel="Add group"
        total={skillEntries.length}
        emptyLabel="Add your first skill group"
      >
        {skillEntries.slice(0, PREVIEW_ROWS).map(([key, group]) => (
          <OverviewRow key={key} href="/content/skills" title={group.label} meta={group.text} />
        ))}
      </OverviewSection>

      <OverviewSection
        label="Taglines"
        href="/content/taglines"
        addLabel="Add tagline"
        total={taglineEntries.length}
        emptyLabel="Add your first tagline"
      >
        {taglineEntries.slice(0, PREVIEW_ROWS).map(([key, text]) => (
          <OverviewRow key={key} href="/content/taglines" title={text} meta={key} />
        ))}
      </OverviewSection>

      <section className="space-y-3">
        <SectionOverline label="Move content" />
        <div className="space-y-2">
          <StartOptionRow
            href="/content/intake"
            icon={FileUp}
            title="Upload a resume"
            description="Extract a draft from a PDF or DOCX and review it before saving."
          />
          <StartOptionRow
            href="/content/import"
            icon={Repeat2}
            title="Import & export content.yaml"
            description="Back up your library, or restore it from a structured file."
          />
        </div>
      </section>
    </div>
  );
}

function SectionOverline({ label }: { label: string }) {
  return (
    <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
      {label}
    </h2>
  );
}

function OverviewSection({
  label,
  href,
  addLabel,
  total,
  emptyLabel,
  children,
}: {
  label: string;
  href: string;
  addLabel: string;
  total: number;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SectionOverline label={label} />
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link href={href} />}
          aria-label={`${addLabel} — ${label}`}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          {addLabel}
        </Button>
      </div>

      {total === 0 ? (
        <Link
          href={href}
          className="focus-visible:ring-ring/50 flex min-h-16 items-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 transition-colors duration-150 outline-none hover:border-slate-300 hover:text-slate-900 focus-visible:ring-3 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-100"
        >
          <Plus aria-hidden="true" className="size-4 shrink-0" />
          {emptyLabel}
        </Link>
      ) : (
        <div className="space-y-2">
          {children}
          {total > PREVIEW_ROWS && (
            <Link
              href={href}
              className="focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-600 transition-colors duration-150 outline-none hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:text-slate-100"
            >
              View all {total}
              <ChevronRight aria-hidden="true" className="size-3.5" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

function OverviewRow({ href, title, meta }: { href: string; title: string; meta?: string }) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring/50 flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors duration-150 outline-none hover:border-slate-300 focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </span>
        {meta ? (
          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
            {meta}
          </span>
        ) : null}
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-slate-400 dark:text-slate-500"
      />
    </Link>
  );
}

function StartOptionRow({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring/50 flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors duration-150 outline-none hover:border-slate-300 focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-slate-400 dark:text-slate-500"
      />
    </Link>
  );
}
