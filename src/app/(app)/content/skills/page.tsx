"use client";

import { useState } from "react";
import { ContentSectionPage } from "@/components/content/content-section-page";
import { SkillCreateSheet } from "@/components/content/skill-create-sheet";
import { SkillGroups } from "@/components/content/skill-groups";

export default function SkillsPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <ContentSectionPage
      title="Skills"
      description="Skills grouped the way they read on a resume — a label, and the comma-separated skills behind it."
      section="your skills"
      action={(content) => (
        <SkillCreateSheet
          existingKeys={Object.keys(content.skills)}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      )}
    >
      {(content) => <SkillGroups skills={content.skills} onAdd={() => setAddOpen(true)} />}
    </ContentSectionPage>
  );
}
