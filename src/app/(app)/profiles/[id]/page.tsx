"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { previewProfile } from "@/lib/api/profiles";
import type { ProfileWrite } from "@/lib/api/profiles";
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

const AUTOSAVE_DEBOUNCE_MS = 400;

export default function ProfileEditorPage() {
  const params = useParams<{ id: string }>();
  const profileId = params.id;

  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(profileId);
  const { data: content, isLoading: contentLoading, error: contentError } = useContent();
  const updateProfile = useUpdateProfile(profileId);

  const [draft, setDraft] = useState<ProfileWrite | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<unknown>(null);

  // Which resume section the left pane is showing. Presentation-only UI
  // state, deliberately outside `draft` — exactly like preview zoom — so
  // changing tabs can never re-trigger the autosave effect below.
  const [tab, setTab] = useState<SectionTab>(DEFAULT_SECTION_TAB);

  // Initialize the draft from the real GET once, and never again from a
  // background refetch — otherwise a stale server response racing an
  // in-flight edit would clobber what the user just typed.
  const initialized = useRef(false);
  useEffect(() => {
    if (profile && !initialized.current) {
      initialized.current = true;
      setDraft(profile);
    }
  }, [profile]);

  // Monotonic guard against out-of-order preview responses (a slow request
  // from an earlier edit resolving after a faster, more recent one).
  const requestSeq = useRef(0);

  async function saveAndPreview(next: ProfileWrite) {
    const seq = ++requestSeq.current;
    setPreviewLoading(true);
    try {
      await updateProfile.mutateAsync(next);
      const html = await previewProfile(profileId);
      if (seq === requestSeq.current) {
        setPreviewHtml(html);
        setPreviewError(null);
      }
    } catch (err) {
      if (seq === requestSeq.current) setPreviewError(err);
    } finally {
      if (seq === requestSeq.current) setPreviewLoading(false);
    }
  }

  // Debounced autosave-then-preview: fires ~400ms after the last edit to
  // any field (typing, checkbox toggles, drag reorders, template switches
  // all funnel through setDraft), per the issue's split-screen spec.
  // Presentation-only state (preview zoom, the active section tab, the
  // mobile edit/preview pane) deliberately lives outside `draft` so it can
  // never re-trigger this effect.
  const skipNextDebounce = useRef(true);
  useEffect(() => {
    if (!draft) return;
    if (skipNextDebounce.current) {
      // The very first draft assignment (straight from GET) is already
      // persisted — only fetch the initial preview, don't PUT it back.
      skipNextDebounce.current = false;
      void previewProfile(profileId).then(setPreviewHtml).catch(setPreviewError);
      return;
    }
    const timer = setTimeout(() => {
      void saveAndPreview(draft);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  function updateDraft(patch: Partial<ProfileWrite>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  async function ensureSaved(): Promise<void> {
    if (!draft) return;
    await updateProfile.mutateAsync(draft);
  }

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
            <Link
              href="/profiles"
              aria-label="Back to resumes"
              className="focus-visible:ring-ring/50 -ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
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
            <SaveState
              isSaving={updateProfile.isPending || previewLoading}
              error={updateProfile.error}
            />
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
            html={previewHtml}
            isLoading={previewLoading}
            error={previewError}
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
