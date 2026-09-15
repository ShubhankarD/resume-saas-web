"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, FileSearch, Plus } from "lucide-react";
import { useJds, useCreateJd, useDeleteJd } from "@/hooks/use-jds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";

/**
 * Client-side UX validation only — the backend (`app/services/jd_service.py`)
 * is the real source of truth and enforces that exactly one of text/url/file
 * is actually usable (an empty text paste or a missing file both 422). The
 * three modes map onto the *same* `POST /api/v1/jds/` multipart endpoint
 * (see lib/api/jds.ts) with different fields set, not three separate
 * endpoints.
 */
type Mode = "text" | "url" | "file";

const MODE_LABELS: Record<Mode, string> = {
  text: "Paste text",
  url: "Paste URL",
  file: "Upload file",
};

const metaSchema = z.object({
  title: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
});
const textSchema = metaSchema.extend({ text: z.string().min(1, "Paste the job description text") });
const urlSchema = metaSchema.extend({ url: z.string().url("Enter a valid URL") });

type TextForm = z.infer<typeof textSchema>;
type UrlForm = z.infer<typeof urlSchema>;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function JdCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-4">
        <div className="bg-muted h-5 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-28 animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  );
}

export default function JdsListPage() {
  const { data: jds, isLoading, error } = useJds();
  const createJd = useCreateJd();
  const deleteJd = useDeleteJd();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<unknown>(null);

  const textForm = useForm<TextForm>({ resolver: zodResolver(textSchema) });
  const urlForm = useForm<UrlForm>({ resolver: zodResolver(urlSchema) });

  async function handleFileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFileError(null);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setFileError(new Error("Choose a file to upload"));
      return;
    }
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim() || undefined;
    const company = String(form.get("company") ?? "").trim() || undefined;
    await createJd.mutateAsync({ mode: "file", file, title, company });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowCreateForm(false);
  }

  const metaFields = (idPrefix: string, registerProps?: "text" | "url") => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <FormField label="Title" htmlFor={`${idPrefix}-title`} hint="Optional">
        <Input
          id={`${idPrefix}-title`}
          placeholder="Staff Engineer"
          {...(registerProps === "text"
            ? textForm.register("title")
            : registerProps === "url"
              ? urlForm.register("title")
              : { name: "title" })}
        />
      </FormField>
      <FormField label="Company" htmlFor={`${idPrefix}-company`} hint="Optional">
        <Input
          id={`${idPrefix}-company`}
          placeholder="Acme Corp"
          {...(registerProps === "text"
            ? textForm.register("company")
            : registerProps === "url"
              ? urlForm.register("company")
              : { name: "company" })}
        />
      </FormField>
    </div>
  );

  const createSheet = (
    <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
      <SheetTrigger render={<Button variant="cta" data-testid="new-jd-button" />}>
        <Plus aria-hidden="true" />
        New job description
      </SheetTrigger>
      <SheetContent className="max-w-lg" closeLabel="Close new job description panel">
        <SheetHeader>
          <SheetTitle>Add a job description</SheetTitle>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Paste the text, paste a job-posting URL, or upload a file — pick one input mode.
          </p>
        </SheetHeader>

        <div
          role="group"
          aria-label="Input mode"
          className="flex flex-wrap gap-2 rounded-xl bg-slate-100/70 p-1 dark:bg-slate-950/40"
        >
          {(["text", "url", "file"] as const).map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={mode === m ? "default" : "ghost"}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              data-testid={`jd-mode-${m}`}
            >
              {MODE_LABELS[m]}
            </Button>
          ))}
        </div>

        {mode === "text" && (
          <form
            onSubmit={textForm.handleSubmit(async (values) => {
              await createJd.mutateAsync({
                mode: "text",
                text: values.text,
                title: values.title,
                company: values.company,
              });
              textForm.reset();
              setShowCreateForm(false);
            })}
            className="flex flex-col gap-6"
          >
            {metaFields("jd-text", "text")}
            <FormField
              label="Job description text"
              htmlFor="jd-text-text"
              error={textForm.formState.errors.text?.message}
              required
            >
              <Textarea
                id="jd-text-text"
                rows={10}
                placeholder="Paste the full job posting text here…"
                {...textForm.register("text")}
              />
            </FormField>
            <ErrorMessage error={createJd.error} />
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={createJd.isPending}
                data-testid="create-jd-submit-text"
              >
                {createJd.isPending ? "Adding…" : "Add job description"}
              </Button>
              <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
            </div>
          </form>
        )}

        {mode === "url" && (
          <form
            onSubmit={urlForm.handleSubmit(async (values) => {
              await createJd.mutateAsync({
                mode: "url",
                url: values.url,
                title: values.title,
                company: values.company,
              });
              urlForm.reset();
              setShowCreateForm(false);
            })}
            className="flex flex-col gap-6"
          >
            {metaFields("jd-url", "url")}
            <FormField
              label="Job posting URL"
              htmlFor="jd-url-url"
              hint="We fetch and store the posting text"
              error={urlForm.formState.errors.url?.message}
              required
            >
              <Input
                id="jd-url-url"
                placeholder="https://careers.example.com/jobs/123"
                {...urlForm.register("url")}
              />
            </FormField>
            <ErrorMessage error={createJd.error} />
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={createJd.isPending}
                data-testid="create-jd-submit-url"
              >
                {createJd.isPending ? "Fetching…" : "Fetch and add"}
              </Button>
              <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
            </div>
          </form>
        )}

        {mode === "file" && (
          <form onSubmit={handleFileSubmit} className="flex flex-col gap-6">
            {metaFields("jd-file")}
            <FormField
              label="File"
              htmlFor="jd-file-input"
              hint="PDF, DOCX, or plain text"
              required
            >
              <input
                ref={fileInputRef}
                id="jd-file-input"
                type="file"
                data-testid="jd-file-input"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-800 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:file:bg-slate-50 dark:file:text-slate-900"
              />
            </FormField>
            <ErrorMessage error={fileError} />
            <ErrorMessage error={createJd.error} />
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={createJd.isPending}
                data-testid="create-jd-submit-file"
              >
                {createJd.isPending ? "Uploading…" : "Upload and add"}
              </Button>
              <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Targets"
        title="Job descriptions"
        description="Save the roles you're applying for, then score any profile against them to see what's covered and what's missing."
        action={createSheet}
      />

      <ErrorMessage error={error} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <JdCardSkeleton />
          <JdCardSkeleton />
          <JdCardSkeleton />
        </div>
      ) : jds?.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No job descriptions yet"
          description="Add a posting by pasting its text, pasting its URL, or uploading a file — then evaluate a profile against it."
          action={
            <Button variant="cta" onClick={() => setShowCreateForm(true)}>
              <Plus aria-hidden="true" />
              New job description
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jds?.map((jd) => (
            <Card key={jd.id} data-testid={`jd-card-${jd.id}`} className="h-full">
              <CardContent className="flex h-full flex-col gap-5">
                <div className="min-w-0 space-y-2">
                  <h2 className="font-heading text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                    {jd.title ?? "Untitled"}
                  </h2>
                  <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                    {jd.company ?? "Company not set"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{jd.source_type}</Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Added {formatDate(jd.created_at)}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <Button nativeButton={false} render={<Link href={`/jds/${jd.id}`} />} size="sm">
                    Open
                    <ArrowRight aria-hidden="true" />
                  </Button>
                  <ConfirmDeleteButton
                    label={`job description ${jd.title ?? jd.id}`}
                    onConfirm={() => deleteJd.mutate(jd.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
