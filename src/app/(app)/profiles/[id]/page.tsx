"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FileDown, History } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { previewProfile } from "@/lib/api/profiles";
import type { ProfileWrite } from "@/lib/api/profiles";
import { ErrorMessage } from "@/components/content/error-message";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProfileBasics } from "@/components/profiles/profile-basics";
import { TemplateGallery } from "@/components/profiles/template-gallery";
import { ExperienceEditor } from "@/components/profiles/experience-editor";
import { SkillsEditor } from "@/components/profiles/skills-editor";
import { EducationEditor } from "@/components/profiles/education-editor";
import { LivePreview } from "@/components/profiles/live-preview";
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
  // Presentation-only state (preview zoom) deliberately lives outside
  // `draft` so it can never re-trigger this effect.
  const skipNextDebounce = useRef(true);
  useEffect(() => {
    if (!draft) return;
    if (skipNextDebounce.current) {
      // The very first draft assignment (straight from GET) is already
      // persisted — only fetch the initial preview, don't PUT it back.
      skipNextDebounce.current = false;
      void previewProfile(profileId)
        .then(setPreviewHtml)
        .catch(setPreviewError);
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

  // The single export implementation for this editor — the preview
  // toolbar's CTA drives it.
  const exportPdf = useResumeExport({ profileId, ensureSaved });

  if (profileLoading || contentLoading) {
    return <EditorSkeleton />;
  }
  if (profileError) return <ErrorMessage error={profileError} />;
  if (contentError) return <ErrorMessage error={contentError} />;
  if (!draft || !content) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title={draft.label}
        titleTestId="profile-editor-label"
        backHref="/profiles"
        action={
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
              <History aria-hidden="true" />
              Export history
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Export history</SheetTitle>
              </SheetHeader>
              <BuildHistory profileId={profileId} />
            </SheetContent>
          </Sheet>
        }
      />


      <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="min-w-0 space-y-10">
          <section className="space-y-6">
            <SectionHeader
              title="Profile setup"
              description="Name this resume, choose how you introduce yourself, and pick a template."
            />
            <ProfileBasics
              draft={draft}
              taglineKeys={Object.keys(content.taglines)}
              onChange={updateDraft}
            />
            <TemplateGallery
              selected={draft.template}
              onSelect={(template) => updateDraft({ template })}
            />
          </section>

          <section className="space-y-6">
            <SectionHeader
              title="Resume content"
              description="Choose the experience, skills, and education that appear on this resume. Every change saves and re-renders the preview automatically."
            />
            <ExperienceEditor content={content} draft={draft} onChange={updateDraft} />
            <SkillsEditor content={content} draft={draft} onChange={updateDraft} />
            <EducationEditor content={content} draft={draft} onChange={updateDraft} />
          </section>
        </div>

        <div className="min-w-0">
          <LivePreview
            html={previewHtml}
            isLoading={previewLoading}
            error={previewError}
            exportAction={
              <Button
                variant="cta"
                size="sm"
                onClick={() => void exportPdf.run()}
                disabled={exportPdf.isPending}
                data-testid="build-pdf"
              >
                <FileDown aria-hidden="true" />
                {exportPdf.isPending ? "Building…" : "Export PDF"}
              </Button>
            }
            status={
              <>
                <ErrorMessage error={exportPdf.buildError} />
                <LatestPdfLink build={exportPdf.lastBuild} />
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Keeps the editor shell's shape while the profile and content queries
 * resolve, so the page doesn't jump once data arrives.
 */
function EditorSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading profile">
      <div className="space-y-3">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="h-[75vh] animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/80 lg:h-[calc(100vh-6rem)] dark:border-slate-800 dark:bg-slate-950" />
      </div>
    </div>
  );
}
