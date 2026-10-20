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
import { EditorSkeleton } from "@/components/profiles/editor-skeleton";
import { SaveState } from "@/components/profiles/save-state";
import { SectionPanel } from "@/components/profiles/section-panels";
import { LivePreview } from "@/components/profiles/live-preview";
import { ResumeWorkspace } from "@/components/profiles/resume-workspace";
import {
  DEFAULT_SECTION_TAB,
  SECTION_TABS,
  type SectionTab,
} from "@/components/profiles/editor-tabs";
import { LatestPdfLink, useResumeExport } from "@/components/profiles/build-panel";

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
            <SectionPanel
              tab={tab}
              profileId={profileId}
              content={content}
              draft={draft}
              onChange={updateDraft}
            />
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
