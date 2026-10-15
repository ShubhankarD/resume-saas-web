"use client";

import Link from "next/link";
import { Briefcase, FileUp, ListChecks, Plus, Repeat2 } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { summarizeContent, TRACKED_SECTIONS } from "@/lib/domain/content-overview";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";
import { ContentSkeleton } from "@/components/content/content-states";
import {
  OverviewRow,
  OverviewSection,
  PREVIEW_ROWS,
  SectionOverline,
  StartOptionRow,
} from "@/components/content/overview-parts";
import { StartLibrary } from "@/components/content/start-library";

export default function ContentOverviewPage() {
  const { data: content, isLoading, error } = useContent();

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
        <StartLibrary />
      </div>
    );
  }

  const summary = summarizeContent(content);
  const skillEntries = Object.entries(content.skills);
  const taglineEntries = Object.entries(content.taglines);

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
          value={`${summary.completeness}%`}
          progress={summary.completeness}
          hint={`${summary.sectionsWithContent} of ${TRACKED_SECTIONS} sections have content`}
          icon={ListChecks}
        />
        <MetricCard
          label="Content entries"
          value={summary.totalEntries}
          hint={`${summary.roleCount} roles · ${summary.bulletCount} bullets · ${summary.skillCount} skill groups`}
          icon={Briefcase}
        />
      </div>

      <OverviewSection
        label="Experience"
        href="/content/experience"
        addLabel="Add role"
        total={summary.roleCount}
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
        total={summary.educationCount}
        emptyLabel="Add a degree or certification"
      >
        {content.education.slice(0, PREVIEW_ROWS).map((entry) => (
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
        total={summary.skillCount}
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
        total={summary.taglineCount}
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
