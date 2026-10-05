"use client";

import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useDebouncedChanges, useDraft, useLatestRequest } from "@/hooks/use-autosave";
import { previewProfile, type ProfileWrite } from "@/lib/api/profiles";

const AUTOSAVE_DEBOUNCE_MS = 400;

/**
 * The profile editor's state machine: a local draft initialized once from
 * GET, debounced autosave (PUT) after every edit, then a fresh server-
 * rendered preview of what was saved. Every edit — typing, checkbox
 * toggles, drag reorders, template switches — funnels through
 * `updateDraft`. Presentation-only state (preview zoom, the active section
 * tab, the mobile edit/preview pane) deliberately lives outside the draft
 * so it can never trigger a save.
 */
export function useProfileEditor(profileId: string) {
  const profileQuery = useProfile(profileId);
  const updateProfile = useUpdateProfile(profileId);
  const [draft, setDraft] = useDraft(profileQuery.data);

  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<unknown>(null);
  const beginPreviewRequest = useLatestRequest();

  async function saveAndPreview(next: ProfileWrite) {
    const isLatest = beginPreviewRequest();
    setPreviewLoading(true);
    try {
      await updateProfile.mutateAsync(next);
      const html = await previewProfile(profileId);
      if (isLatest()) {
        setPreviewHtml(html);
        setPreviewError(null);
      }
    } catch (err) {
      if (isLatest()) setPreviewError(err);
    } finally {
      if (isLatest()) setPreviewLoading(false);
    }
  }

  useDebouncedChanges(draft, {
    delayMs: AUTOSAVE_DEBOUNCE_MS,
    // The very first draft (straight from GET) is already persisted — only
    // fetch the initial preview, don't PUT it back.
    onInitial: () => void previewProfile(profileId).then(setPreviewHtml).catch(setPreviewError),
    onChange: (next) => void saveAndPreview(next),
  });

  function updateDraft(patch: Partial<ProfileWrite>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  /** Flushes the current draft immediately (e.g. before a PDF export). */
  async function ensureSaved(): Promise<void> {
    if (!draft) return;
    await updateProfile.mutateAsync(draft);
  }

  return {
    profileQuery,
    draft,
    updateDraft,
    ensureSaved,
    save: { isSaving: updateProfile.isPending || previewLoading, error: updateProfile.error },
    preview: { html: previewHtml, isLoading: previewLoading, error: previewError },
  };
}
