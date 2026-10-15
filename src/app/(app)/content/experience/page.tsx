"use client";

import { useState } from "react";
import { ContentSectionPage } from "@/components/content/content-section-page";
import { RoleCreateSheet } from "@/components/content/role-create-sheet";
import { RoleList } from "@/components/content/role-list";

/**
 * The nested roles -> groups -> bullets editor (plans/phase-F3-content-editor.md).
 * Every add/edit/delete here calls the granular CRUD endpoints
 * (app/api/content.py) directly — never a full `PUT /content/` — via the
 * scoped mutation hooks in use-content.ts, which invalidate the shared
 * `content` query afterward.
 */
export default function ExperiencePage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <ContentSectionPage
      title="Experience"
      description="Each role holds bullet groups, and each group holds the accomplishments a tailored resume draws from."
      section="your experience"
      action={(content) => (
        <RoleCreateSheet
          existingIds={content.experience.map((r) => r.id)}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      )}
    >
      {(content) => <RoleList roles={content.experience} onAdd={() => setAddOpen(true)} />}
    </ContentSectionPage>
  );
}
