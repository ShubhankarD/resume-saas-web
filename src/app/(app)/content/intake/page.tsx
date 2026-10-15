"use client";

import { useRouter } from "next/navigation";
import { useIntakeFlow } from "@/hooks/use-intake-flow";
import { IntakeDraftReview } from "@/components/content/intake-draft-review";
import { IntakeUpload } from "@/components/content/intake-upload";

export default function IntakePage() {
  const router = useRouter();
  const flow = useIntakeFlow({ onSaved: () => router.push("/content") });

  if (!flow.draft) {
    return (
      <IntakeUpload onFile={flow.upload} isPending={flow.isExtracting} error={flow.extractError} />
    );
  }

  return (
    <IntakeDraftReview
      draft={flow.draft}
      onNameChange={flow.setName}
      onSave={flow.save}
      onDiscard={flow.discard}
      isSaving={flow.isSaving}
      error={flow.saveError}
    />
  );
}
