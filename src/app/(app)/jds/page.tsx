"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useJds, useCreateJd, useDeleteJd } from "@/hooks/use-jds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const metaSchema = z.object({
  title: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
});
const textSchema = metaSchema.extend({ text: z.string().min(1, "Paste the job description text") });
const urlSchema = metaSchema.extend({ url: z.string().url("Enter a valid URL") });

type TextForm = z.infer<typeof textSchema>;
type UrlForm = z.infer<typeof urlSchema>;

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Job descriptions</h1>
        <Button onClick={() => setShowCreateForm((v) => !v)} data-testid="new-jd-button">
          <Plus /> New job description
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add a job description</CardTitle>
            <CardDescription>
              Paste the text, paste a job-posting URL, or upload a file — pick one input mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              {(["text", "url", "file"] as const).map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={mode === m ? "default" : "outline"}
                  onClick={() => setMode(m)}
                  data-testid={`jd-mode-${m}`}
                >
                  {m === "text" ? "Paste text" : m === "url" ? "Paste URL" : "Upload file"}
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
                className="flex flex-col gap-3"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jd-text-title">Title (optional)</Label>
                    <Input id="jd-text-title" placeholder="Staff Engineer" {...textForm.register("title")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jd-text-company">Company (optional)</Label>
                    <Input id="jd-text-company" placeholder="Acme Corp" {...textForm.register("company")} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="jd-text-text">Job description text</Label>
                  <Textarea
                    id="jd-text-text"
                    rows={8}
                    placeholder="Paste the full job posting text here…"
                    {...textForm.register("text")}
                  />
                  {textForm.formState.errors.text && (
                    <p className="text-destructive text-xs">
                      {textForm.formState.errors.text.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={createJd.isPending}
                  data-testid="create-jd-submit-text"
                  className="self-start"
                >
                  {createJd.isPending ? "Adding…" : "Add job description"}
                </Button>
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
                className="flex flex-col gap-3"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jd-url-title">Title (optional)</Label>
                    <Input id="jd-url-title" placeholder="Staff Engineer" {...urlForm.register("title")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jd-url-company">Company (optional)</Label>
                    <Input id="jd-url-company" placeholder="Acme Corp" {...urlForm.register("company")} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="jd-url-url">Job posting URL</Label>
                  <Input
                    id="jd-url-url"
                    placeholder="https://careers.example.com/jobs/123"
                    {...urlForm.register("url")}
                  />
                  {urlForm.formState.errors.url && (
                    <p className="text-destructive text-xs">{urlForm.formState.errors.url.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={createJd.isPending}
                  data-testid="create-jd-submit-url"
                  className="self-start"
                >
                  {createJd.isPending ? "Fetching…" : "Fetch and add"}
                </Button>
              </form>
            )}

            {mode === "file" && (
              <form onSubmit={handleFileSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jd-file-title">Title (optional)</Label>
                    <Input id="jd-file-title" name="title" placeholder="Staff Engineer" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="jd-file-company">Company (optional)</Label>
                    <Input id="jd-file-company" name="company" placeholder="Acme Corp" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="jd-file-input">File</Label>
                  <input
                    ref={fileInputRef}
                    id="jd-file-input"
                    type="file"
                    className="text-sm"
                    data-testid="jd-file-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createJd.isPending}
                  data-testid="create-jd-submit-file"
                  className="self-start"
                >
                  {createJd.isPending ? "Uploading…" : "Upload and add"}
                </Button>
                <ErrorMessage error={fileError} />
              </form>
            )}

            <ErrorMessage error={createJd.error} />
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-muted-foreground text-sm">Loading job descriptions…</p>}
      <ErrorMessage error={error} />

      {jds?.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm">
          No job descriptions yet — add one to evaluate a profile against it.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {jds?.map((jd) => (
          <Card key={jd.id} data-testid={`jd-card-${jd.id}`}>
            <CardHeader>
              <CardTitle>{jd.title ?? "Untitled"}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {jd.company && <span>{jd.company}</span>}
                <Badge variant="outline">{jd.source_type}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <Button nativeButton={false} render={<Link href={`/jds/${jd.id}`} />} size="sm">
                View / Evaluate
              </Button>
              <ConfirmDeleteButton
                label={`job description ${jd.title ?? jd.id}`}
                onConfirm={() => deleteJd.mutate(jd.id)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
