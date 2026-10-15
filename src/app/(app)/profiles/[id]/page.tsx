"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { FileDown } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { useProfileEditor } from "@/hooks/use-profile-editor";
import { ErrorMessage } from "@/components/content/error-message";
import { Button } from "@/components/ui/button";
import { CompactTabs } from "@/components/ui/compact-tabs";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { ProfileBasics } from "@/components/profiles/profile-basics";
import { TemplateGallery } from "@/components/profiles/template-gallery";
import { ExperienceEditor } from "@/components/profiles/experience-editor";
import { SkillsEditor } from "@/components/profiles/skills-editor";
import { EducationEditor } from "@/components/profiles/education-editor";
import { LivePreview } from "@/components/profiles/live-preview";
import { ResumeWorkspace } from "@/components/profiles/resume-workspace";
import {
  DEFAULT_SECTION_TAB,
  EditorPanel,
  SECTION_TABS,
  type SectionTab,
} from "@/components/profiles/editor-tabs";
import { BuildHistory, LatestPdfLink, useResumeExport } from "@/components/profiles/build-panel";

export default function ProfileEditorPage() {
  const params = useParams<{ id: string }>();
  const profileId = params.id;

  const { profileQuery, draft, updateDraft, ensureSaved, save, preview } =
    useProfileEditor(profileId);
  const { isLoading: profileLoading, error: profileError } = profileQuery;
  const { data: content, isLoading: contentLoading, error: contentError } = useContent();

  // Which resume section the left pane is showing. Presentation-only UI
  // state, deliberately outside `draft` — exactly like preview zoom — so
  // changing tabs can never trigger an autosave.
  const [tab, setTab] = useState<SectionTab>(DEFAULT_SECTION_TAB);

  // The single export implementation for this editor — the contextual
  // toolbar's CTA drives it.
  const exportPdf = useResumeExport({ profileId, ensureSaved });

  if (profileLoading || contentLoading) {
    return <EditorSkeleton />;
  }
  if (profileError) return <ErrorMessage error={profileError} />;
  if (contentError) return <ErrorMessage error={contentError} />;
  if (!draft || !content) return null;

  return (
    <div className="min-w-0 space-y-4">
      {/* §12 — contextual toolbar: back + resume name, save state, export. */}
      <PageToolbar
        sticky
        left={
          <div className="flex min-w-0 items-center gap-2">
            <BackLink href="/profiles" label="Back to resumes" className="-ml-1" />
            <p
              data-testid="profile-editor-label"
              className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 sm:text-base dark:text-slate-50"
            >
              {draft.label}
            </p>
          </div>
        }
        right={
          <div className="flex shrink-0 items-center gap-3">
            <SaveState isSaving={save.isSaving} error={save.error} />
            <Button
              variant="cta"
              onClick={() => void exportPdf.run()}
              disabled={exportPdf.isPending}
              data-testid="build-pdf"
            >
              <FileDown aria-hidden="true" />
              {exportPdf.isPending ? "Building…" : "Export PDF"}
            </Button>
          </div>
        }
      />

      {/* §13 — compact section tabs. */}
      <CompactTabs
        value={tab}
        onValueChange={(value) => setTab(value as SectionTab)}
        items={SECTION_TABS}
        aria-label="Resume sections"
      />

      {/* §11 / §37 — split workspace on desktop, pane switch below lg. */}
      <ResumeWorkspace
        editor={
          <>
            {tab === "personal" ? (
              <EditorPanel tab="personal" title="Personal">
                <ProfileBasics
                  draft={draft}
                  taglineKeys={Object.keys(content.taglines)}
                  onChange={updateDraft}
                />
              </EditorPanel>
            ) : null}

            {tab === "experience" ? (
              <EditorPanel tab="experience" title="Experience">
                <ExperienceEditor content={content} draft={draft} onChange={updateDraft} />
              </EditorPanel>
            ) : null}

            {tab === "education" ? (
              <EditorPanel tab="education" title="Education">
                <EducationEditor content={content} draft={draft} onChange={updateDraft} />
              </EditorPanel>
            ) : null}

            {tab === "skills" ? (
              <EditorPanel tab="skills" title="Skills">
                <SkillsEditor content={content} draft={draft} onChange={updateDraft} />
              </EditorPanel>
            ) : null}

            {tab === "customize" ? (
              <EditorPanel tab="customize" title="Customize">
                <TemplateGallery
                  selected={draft.template}
                  onSelect={(template) => updateDraft({ template })}
                />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
                    Export history
                  </h3>
                  <BuildHistory profileId={profileId} />
                </div>
              </EditorPanel>
            ) : null}
          </>
        }
        preview={
          <LivePreview
            html={preview.html}
            isLoading={preview.isLoading}
            error={preview.error}
            status={
              <>
                <ErrorMessage error={exportPdf.buildError} />
                <LatestPdfLink build={exportPdf.lastBuild} />
              </>
            }
          />
        }
      />
    </div>
  );
}

/**
 * Honest save indicator: derived entirely from the mutation and preview
 * state that already drives the autosave cycle — no extra state, no timer.
 */
function SaveState({ isSaving, error }: { isSaving: boolean; error: unknown }) {
  const label = error ? "Couldn't save" : isSaving ? "Saving…" : "Saved";
  return (
    <span
      aria-live="polite"
      className={
        error
          ? "text-destructive hidden text-xs font-medium sm:inline"
          : "hidden text-xs text-slate-500 sm:inline dark:text-slate-400"
      }
    >
      {label}
    </span>
  );
}

/**
 * Keeps the editor shell's shape while the profile and content queries
 * resolve, so the page doesn't jump once data arrives.
 */
function EditorSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading profile">
      <div className="flex h-14 items-center justify-between gap-3">
        <div className="h-5 w-48 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="flex h-11 items-center gap-6 border-b border-slate-200/80 dark:border-slate-800">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-8">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="h-[70vh] animate-pulse rounded-xl border border-slate-200/80 bg-slate-100/70 lg:h-[calc(100vh-6rem)] dark:border-slate-800 dark:bg-slate-950" />
      </div>
    </div>
  );
}
