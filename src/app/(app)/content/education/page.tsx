"use client";

import { useState } from "react";
import { ContentSectionPage } from "@/components/content/content-section-page";
import { EducationCreateSheet } from "@/components/content/education-create-sheet";
import { EducationList } from "@/components/content/education-list";

export default function EducationPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <ContentSectionPage
      title="Education"
      description="Degrees, certifications, and training. Each entry has its own id so resumes can reference it directly."
      section="your education"
      action={<EducationCreateSheet open={addOpen} onOpenChange={setAddOpen} />}
    >
      {(content) => <EducationList education={content.education} onAdd={() => setAddOpen(true)} />}
    </ContentSectionPage>
  );
}
