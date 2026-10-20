"use client";

import type { ReactNode } from "react";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { EditorPanel, type SectionTab } from "@/components/profiles/editor-tabs";
import { ProfileBasics } from "@/components/profiles/profile-basics";
import { ExperienceEditor } from "@/components/profiles/experience-editor";
import { EducationEditor } from "@/components/profiles/education-editor";
import { SkillsEditor } from "@/components/profiles/skills-editor";
import { TemplateGallery } from "@/components/profiles/template-gallery";
import { BuildHistory } from "@/components/profiles/build-panel";

export interface SectionPanelProps {
  profileId: string;
  content: ContentIn;
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}

/**
 * Tab → panel. A new resume section is a `SECTION_TABS` entry plus a row here;
 * the editor page does not change.
 */
const SECTION_PANELS: Record<
  SectionTab,
  { title: string; render: (p: SectionPanelProps) => ReactNode }
> = {
  personal: {
    title: "Personal",
    render: ({ content, draft, onChange }) => (
      <ProfileBasics
        draft={draft}
        taglineKeys={Object.keys(content.taglines)}
        onChange={onChange}
      />
    ),
  },
  experience: {
    title: "Experience",
    render: (p) => <ExperienceEditor content={p.content} draft={p.draft} onChange={p.onChange} />,
  },
  education: {
    title: "Education",
    render: (p) => <EducationEditor content={p.content} draft={p.draft} onChange={p.onChange} />,
  },
  skills: {
    title: "Skills",
    render: (p) => <SkillsEditor content={p.content} draft={p.draft} onChange={p.onChange} />,
  },
  customize: {
    title: "Customize",
    render: ({ profileId, draft, onChange }) => (
      <>
        <TemplateGallery
          selected={draft.template}
          onSelect={(template) => onChange({ template })}
        />
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
            Export history
          </h3>
          <BuildHistory profileId={profileId} />
        </div>
      </>
    ),
  },
};

export function SectionPanel({ tab, ...props }: SectionPanelProps & { tab: SectionTab }) {
  const { title, render } = SECTION_PANELS[tab];
  return (
    <EditorPanel tab={tab} title={title}>
      {render(props)}
    </EditorPanel>
  );
}
