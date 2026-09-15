"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { previewProfile } from "@/lib/api/profiles";
import type { ProfileWrite } from "@/lib/api/profiles";
import { ErrorMessage } from "@/components/content/error-message";
import { Button } from "@/components/ui/button";
import { ProfileBasics } from "@/components/profiles/profile-basics";
import { TemplateGallery } from "@/components/profiles/template-gallery";
import { ExperienceEditor } from "@/components/profiles/experience-editor";
import { SkillsEditor } from "@/components/profiles/skills-editor";
import { EducationEditor } from "@/components/profiles/education-editor";
import { LivePreview } from "@/components/profiles/live-preview";
import { BuildPanel } from "@/components/profiles/build-panel";

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

  if (profileLoading || contentLoading) {
    return <p className="text-muted-foreground text-sm">Loading profile…</p>;
  }
  if (profileError) return <ErrorMessage error={profileError} />;
  if (contentError) return <ErrorMessage error={contentError} />;
  if (!draft || !content) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href="/profiles" />}>
          <ArrowLeft />
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50" data-testid="profile-editor-label">
          {draft.label}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ProfileBasics
            draft={draft}
            taglineKeys={Object.keys(content.taglines)}
            onChange={updateDraft}
          />
          <TemplateGallery selected={draft.template} onSelect={(template) => updateDraft({ template })} />
          <ExperienceEditor content={content} draft={draft} onChange={updateDraft} />
          <SkillsEditor content={content} draft={draft} onChange={updateDraft} />
          <EducationEditor content={content} draft={draft} onChange={updateDraft} />
          <BuildPanel profileId={profileId} ensureSaved={ensureSaved} />
        </div>

        <div>
          <LivePreview html={previewHtml} isLoading={previewLoading} error={previewError} />
        </div>
      </div>
    </div>
  );
}
