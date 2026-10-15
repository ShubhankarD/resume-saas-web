"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { intakeResume } from "@/lib/api/content-upload";
import type { IntakeResponse } from "@/lib/api/content";
import { intakeToContent } from "@/lib/domain/intake";
import { useReplaceContent } from "@/hooks/use-content";

/**
 * Resume-upload "intake" flow (POST /api/v1/content/intake). The backend
 * never persists this — it's a stateless LLM extraction that hands back a
 * ContentIn-shaped draft plus `warnings` for the human to review. This hook
 * enforces the same rule client-side: nothing gets saved until `save()` is
 * called, which does a real `PUT /api/v1/content/` with the (lightly
 * edited) draft — never auto-saved on the intake response itself.
 *
 * Navigation after a save is the caller's concern (`onSaved`).
 */
export function useIntakeFlow({ onSaved }: { onSaved: () => void }) {
  const [draft, setDraft] = useState<IntakeResponse | null>(null);

  const extract = useMutation({
    mutationFn: (file: File) => intakeResume(file),
    onSuccess: setDraft,
  });
  const replaceContent = useReplaceContent();

  return {
    draft,
    upload: extract.mutate,
    isExtracting: extract.isPending,
    extractError: extract.error,
    setName: (name: string) => setDraft((d) => (d ? { ...d, name } : d)),
    discard: () => setDraft(null),
    save: () => {
      if (draft) replaceContent.mutate(intakeToContent(draft), { onSuccess: onSaved });
    },
    isSaving: replaceContent.isPending,
    saveError: replaceContent.error,
  };
}
