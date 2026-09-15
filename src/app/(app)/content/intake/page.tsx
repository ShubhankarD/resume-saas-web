"use client";

import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileUp } from "lucide-react";
import { intakeResume } from "@/lib/api/content-upload";
import { putContent, type IntakeResponse } from "@/lib/api/content";
import { contentQueryKey } from "@/hooks/use-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";

/**
 * Resume-upload "intake" flow (POST /api/v1/content/intake). The backend
 * never persists this — it's a stateless LLM extraction that hands back a
 * ContentIn-shaped draft plus `warnings` for the human to review. This page
 * enforces the same rule client-side: nothing gets saved until the user
 * explicitly clicks "Save this draft", which does a real
 * `PUT /api/v1/content/` with (lightly edited) draft — never auto-saved on
 * the intake response itself.
 */
export default function IntakePage() {
  const [draft, setDraft] = useState<IntakeResponse | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const nameFieldId = useId();

  const intakeMutation = useMutation({
    mutationFn: (file: File) => intakeResume(file),
    onSuccess: (data) => setDraft(data),
  });

  const saveMutation = useMutation({
    mutationFn: (toSave: IntakeResponse) => {
      const contentIn: import("@/lib/api/content").ContentIn = {
        name: toSave.name,
        photo: toSave.photo,
        contact: toSave.contact,
        taglines: toSave.taglines,
        skills: toSave.skills,
        experience: toSave.experience,
        education: toSave.education,
        application: toSave.application,
      };
      return putContent(contentIn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      router.push("/content");
    },
  });

  if (!draft) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Content library"
          title="Upload an existing resume"
          description="Upload a PDF, DOCX, or plain-text resume. We'll extract a draft for you to review — nothing is saved until you explicitly approve it."
        />

        <Card className="p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
            <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <FileUp aria-hidden="true" className="size-5" />
            </span>
            <label
              htmlFor="intake-file"
              className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            >
              Choose a resume file
            </label>
            <span className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              PDF, DOCX, or plain text. Extraction takes a moment.
            </span>
            <input
              id="intake-file"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              data-testid="intake-file-input"
              disabled={intakeMutation.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) intakeMutation.mutate(file);
              }}
              className="mt-6 block w-full max-w-sm cursor-pointer text-sm text-slate-600 file:mr-4 file:h-10 file:cursor-pointer file:rounded-xl file:border-0 file:bg-amber-500 file:px-4 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400"
            />
          </div>

          {intakeMutation.isPending && (
            <p className="mt-5 text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
              Extracting a draft… this can take a moment.
            </p>
          )}
          <div className="mt-5">
            <ErrorMessage error={intakeMutation.error} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resume intake"
        title="Review the extracted draft"
        description="Nothing is saved yet. Check this over, fix the name if it came through wrong, then save."
        action={
          <Button
            variant="cta"
            onClick={() => saveMutation.mutate(draft)}
            disabled={saveMutation.isPending}
            data-testid="save-intake-draft"
          >
            {saveMutation.isPending ? "Saving…" : "Save this draft"}
          </Button>
        }
      />

      {draft.warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-5 sm:p-6 dark:border-amber-900/60 dark:bg-amber-950/20">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
            <AlertTriangle aria-hidden="true" className="size-4" />
            Review before saving
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900/90 dark:text-amber-200/90">
            {draft.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <Card className="space-y-8 p-6 sm:p-8">
        <FormField label="Name" htmlFor={nameFieldId} className="max-w-md">
          <Input
            id={nameFieldId}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </FormField>

        <Section title="Contact">
          {draft.contact.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {draft.contact.map((c, i) => (
                <li key={i}>
                  {c.icon}: {c.text} {c.url && `(${c.url})`}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Taglines">
          {Object.keys(draft.taglines).length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {Object.entries(draft.taglines).map(([key, text]) => (
                <li key={key}>
                  <span className="text-slate-500 dark:text-slate-400">{key}:</span> {text}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Skills">
          {Object.keys(draft.skills).length === 0 ? (
            <Empty />
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(draft.skills).map(([key, group]) => (
                <Badge key={key} variant="outline" className="h-auto py-1 whitespace-normal">
                  {group.label}: {group.text}
                </Badge>
              ))}
            </div>
          )}
        </Section>

        <Section
          title={`Experience (${draft.experience.length} role${draft.experience.length === 1 ? "" : "s"})`}
        >
          {draft.experience.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {draft.experience.map((role) => (
                <div
                  key={role.id}
                  className="rounded-xl border border-slate-200/80 p-4 sm:p-5 dark:border-slate-800"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {role.title}{" "}
                    <span className="font-normal text-slate-500 dark:text-slate-400">
                      · {role.org} · {role.dates}
                    </span>
                  </p>
                  {role.groups.map((group) => (
                    <ul
                      key={group.id}
                      className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {group.bullets.map((b) => (
                        <li key={b.id}>{b.text}</li>
                      ))}
                    </ul>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Education">
          {draft.education.length === 0 ? (
            <Empty />
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {draft.education.map((e) => (
                <li key={e.id}>{e.text}</li>
              ))}
            </ul>
          )}
        </Section>

        <ErrorMessage error={saveMutation.error} />

        <div className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-6 dark:border-slate-800">
          <Button
            variant="cta"
            onClick={() => saveMutation.mutate(draft)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving…" : "Save this draft"}
          </Button>
          <Button variant="ghost" onClick={() => setDraft(null)} disabled={saveMutation.isPending}>
            Discard and start over
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <SectionHeader title={title} />
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-slate-500 italic dark:text-slate-400">Nothing detected.</p>;
}
