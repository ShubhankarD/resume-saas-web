"use client";

import type { ReactNode } from "react";

/**
 * The five resume sections shown as compact tabs above the split workspace
 * (blueprint §13). This is pure UI state in the editor page — it never
 * reaches `draft`, so switching tabs can't trigger the debounced autosave.
 */
export const SECTION_TABS = [
  { value: "personal", label: "Personal" },
  { value: "experience", label: "Experience" },
  { value: "education", label: "Education" },
  { value: "skills", label: "Skills" },
  { value: "customize", label: "Customize" },
] as const;

export type SectionTab = (typeof SECTION_TABS)[number]["value"];

export const DEFAULT_SECTION_TAB: SectionTab = "personal";

/**
 * One editor pane. This supplies only the tabpanel semantics and spacing —
 * the visible heading is the `SectionHeader` each section editor already
 * renders (blueprint §14: 14–16px semibold heading, muted one-line
 * description, compact action). Rendering a second heading here stacked two
 * titles in every panel, so `title` is used for the accessible name only.
 */
export function EditorPanel({
  tab,
  title,
  children,
}: {
  tab: SectionTab;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`resume-panel-${tab}`}
      role="tabpanel"
      aria-label={title}
      tabIndex={-1}
      className="min-w-0 space-y-6 outline-none"
    >
      {children}
    </section>
  );
}
