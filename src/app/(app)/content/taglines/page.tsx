"use client";

import { useState } from "react";
import { ContentSectionPage } from "@/components/content/content-section-page";
import { TaglineCreateSheet } from "@/components/content/tagline-create-sheet";
import { TaglineList } from "@/components/content/tagline-list";

export default function TaglinesPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <ContentSectionPage
      title="Taglines"
      description="Short positioning statements, keyed by name. A tailored resume picks one to sit under your name."
      section="your taglines"
      action={<TaglineCreateSheet open={addOpen} onOpenChange={setAddOpen} />}
    >
      {(content) => <TaglineList taglines={content.taglines} onAdd={() => setAddOpen(true)} />}
    </ContentSectionPage>
  );
}
