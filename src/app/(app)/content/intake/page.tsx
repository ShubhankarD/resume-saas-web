"use client";

import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Upload } from "lucide-react";
import { intakeResume } from "@/lib/api/content-upload";
import { putContent, type IntakeResponse } from "@/lib/api/content";
import { contentQueryKey } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";
import { cn } from "cn";

const WHAT_HAPPENS_NEXT = [
  "We extract your experience, skills, and education.",
  "You review the draft and fix anything that came through wrong.",
  "Nothing is saved until you press save.",
] as const;

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
  const [dragActive, setDragActive] = useState(false);
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
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader
          eyebrow="Content library"
          title="Upload your resume"
          description="Import an existing resume to create your content library. Nothing is saved until you approve it."
        />

        {/* A div, not a <label>, so clicking the nested file input cannot
            dispatch the picker twice; the visible "Upload resume" text below
            is the input's real <label htmlFor>. */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!intakeMutation.isPending) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (intakeMutation.isPending) return;
            const file = e.dataTransfer.files?.[0];
            if (file) intakeMutation.mutate(file);
          }}
          className={cn(
            "focus-within:ring-ring/50 flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition-colors duration-150 focus-within:ring-3 sm:px-6",
            dragActive
              ? "border-amber-500 bg-amber-50/60 dark:border-amber-500 dark:bg-amber-950/20"
              : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600",
            intakeMutation.isPending && "cursor-not-allowed opacity-70",
          )}
        >
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {intakeMutation.isPending ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Upload aria-hidden="true" className="size-4" />
            )}
          </span>

          <label
            htmlFor="intake-file"
            className="mt-3 cursor-pointer text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100"
          >
            {intakeMutation.isPending ? "Extracting a draft…" : "Upload resume"}
          </label>
          <span className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Drag and drop a PDF or DOCX here, or choose a file.
          </span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            PDF · DOCX · plain text
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
            className="focus-visible:ring-ring/50 mt-4 block w-full max-w-xs cursor-pointer rounded-md text-xs text-slate-600 outline-none file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-amber-400 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400"
          />
        </div>

        {intakeMutation.isPending && (
          <p aria-live="polite" className="sr-only">
            Extracting a draft from your resume.
          </p>
        )}
        <ErrorMessage error={intakeMutation.error} />

        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            What happens next
          </h2>
          <ul className="space-y-2">
            {WHAT_HAPPENS_NEXT.map((step) => (
              <li
                key={step}
                className="flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-slate-400"
              >
                <Check
                  aria-hidden="true"
                  className="mt-1 size-3.5 shrink-0 text-green-600 dark:text-green-400"
                />
                {step}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </FormField>

        <Section title="Contact">
          {draft.contact.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
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
            <ul className="space-y-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
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
            <div className="flex flex-wrap gap-1.5">
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
                    <ul
                      key={group.id}
                      className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300"
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
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {draft.education.map((e) => (
                <li key={e.id}>{e.text}</li>
              ))}
            </ul>
          )}
        </Section>

        <ErrorMessage error={saveMutation.error} />

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setDraft(null)} disabled={saveMutation.isPending}>
            Discard and start over
          </Button>
          <Button
            variant="cta"
            onClick={() => saveMutation.mutate(draft)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving…" : "Save this draft"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-slate-500 italic dark:text-slate-400">Nothing detected.</p>;
}
