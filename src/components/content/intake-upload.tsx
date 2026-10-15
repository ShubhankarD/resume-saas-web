"use client";

import { useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { cn } from "cn";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";
import { SectionOverline } from "@/components/content/overview-parts";

const WHAT_HAPPENS_NEXT = [
  "We extract your experience, skills, and education.",
  "You review the draft and fix anything that came through wrong.",
  "Nothing is saved until you press save.",
] as const;

/** The upload step: a drop zone for a resume file and a note on what follows. */
export function IntakeUpload({
  onFile,
  isPending,
  error,
}: {
  onFile: (file: File) => void;
  isPending: boolean;
  error: unknown;
}) {
  const [dragActive, setDragActive] = useState(false);

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
          if (!isPending) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (isPending) return;
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={cn(
          "focus-within:ring-ring/50 flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition-colors duration-150 focus-within:ring-3 sm:px-6",
          dragActive
            ? "border-amber-500 bg-amber-50/60 dark:border-amber-500 dark:bg-amber-950/20"
            : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600",
          isPending && "cursor-not-allowed opacity-70",
        )}
      >
        <span className="inline-flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {isPending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="size-4" />
          )}
        </span>

        <label
          htmlFor="intake-file"
          className="mt-3 cursor-pointer text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100"
        >
          {isPending ? "Extracting a draft…" : "Upload resume"}
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
          disabled={isPending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
          className="focus-visible:ring-ring/50 mt-4 block w-full max-w-xs cursor-pointer rounded-md text-xs text-slate-600 outline-none file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-amber-400 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400"
        />
      </div>

      {isPending && (
        <p aria-live="polite" className="sr-only">
          Extracting a draft from your resume.
        </p>
      )}
      <ErrorMessage error={error} />

      <section className="space-y-3">
        <SectionOverline label="What happens next" />
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
