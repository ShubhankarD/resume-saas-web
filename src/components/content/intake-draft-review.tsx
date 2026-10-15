"use client";

import { useId } from "react";
import { AlertTriangle } from "lucide-react";
import type { IntakeResponse } from "@/lib/api/content";
import { pluralize } from "@/lib/domain/plural";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";
import { SectionOverline } from "@/components/content/overview-parts";

const LIST_CLASS = "space-y-1 text-sm leading-6 text-slate-700 dark:text-slate-300";
const BULLET_LIST_CLASS = `list-disc pl-5 ${LIST_CLASS}`;

interface IntakeDraftReviewProps {
  draft: IntakeResponse;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  error: unknown;
}

/** The review step: the extracted draft, its warnings, and save / discard. Nothing is persisted until Save. */
export function IntakeDraftReview({
  draft,
  onNameChange,
  onSave,
  onDiscard,
  isSaving,
  error,
}: IntakeDraftReviewProps) {
  const nameFieldId = useId();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resume intake"
        title="Review the extracted draft"
        description="Nothing is saved yet. Check this over, fix the name if it came through wrong, then save."
        action={<SaveButton onClick={onSave} isSaving={isSaving} testId="save-intake-draft" />}
      />

      {draft.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 sm:p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
            <AlertTriangle aria-hidden="true" className="size-4" />
            Review before saving
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-900/90 dark:text-amber-200/90">
            {draft.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <FormField label="Name" htmlFor={nameFieldId} className="max-w-md">
          <Input
            id={nameFieldId}
            value={draft.name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </FormField>

        <DraftSection title="Contact" isEmpty={draft.contact.length === 0}>
          <ul className={LIST_CLASS}>
            {draft.contact.map((c, i) => (
              <li key={i}>
                {c.icon}: {c.text} {c.url && `(${c.url})`}
              </li>
            ))}
          </ul>
        </DraftSection>

        <DraftSection title="Taglines" isEmpty={Object.keys(draft.taglines).length === 0}>
          <ul className={LIST_CLASS}>
            {Object.entries(draft.taglines).map(([key, text]) => (
              <li key={key}>
                <span className="text-slate-500 dark:text-slate-400">{key}:</span> {text}
              </li>
            ))}
          </ul>
        </DraftSection>

        <DraftSection title="Skills" isEmpty={Object.keys(draft.skills).length === 0}>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(draft.skills).map(([key, group]) => (
              <Badge key={key} variant="outline" className="h-auto py-1 whitespace-normal">
                {group.label}: {group.text}
              </Badge>
            ))}
          </div>
        </DraftSection>

        <DraftSection
          title={`Experience (${pluralize(draft.experience.length, "role")})`}
          isEmpty={draft.experience.length === 0}
        >
          <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {draft.experience.map((role) => (
              <div key={role.id} className="py-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {role.title}{" "}
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    · {role.org} · {role.dates}
                  </span>
                </p>
                {role.groups.map((group) => (
                  <ul key={group.id} className={`mt-1.5 ${BULLET_LIST_CLASS}`}>
                    {group.bullets.map((b) => (
                      <li key={b.id}>{b.text}</li>
                    ))}
                  </ul>
                ))}
              </div>
            ))}
          </div>
        </DraftSection>

        <DraftSection title="Education" isEmpty={draft.education.length === 0}>
          <ul className={BULLET_LIST_CLASS}>
            {draft.education.map((e) => (
              <li key={e.id}>{e.text}</li>
            ))}
          </ul>
        </DraftSection>

        <ErrorMessage error={error} />

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button variant="ghost" onClick={onDiscard} disabled={isSaving}>
            Discard and start over
          </Button>
          <SaveButton onClick={onSave} isSaving={isSaving} />
        </div>
      </div>
    </div>
  );
}

function SaveButton({
  onClick,
  isSaving,
  testId,
}: {
  onClick: () => void;
  isSaving: boolean;
  testId?: string;
}) {
  return (
    <Button variant="cta" onClick={onClick} disabled={isSaving} data-testid={testId}>
      {isSaving ? "Saving…" : "Save this draft"}
    </Button>
  );
}

function DraftSection({
  title,
  isEmpty,
  children,
}: {
  title: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <SectionOverline label={title} />
      {isEmpty ? (
        <p className="text-sm text-slate-500 italic dark:text-slate-400">Nothing detected.</p>
      ) : (
        children
      )}
    </div>
  );
}
