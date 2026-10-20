"use client";

import { useRef, useState, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { surfacedElsewhere } from "@/lib/form-submit";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateJdInput } from "@/lib/api/jds";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/content/error-message";
import {
  FILE_INPUT_CLASS,
  FORM_CLASS,
  FormActions,
  MetaFields,
} from "@/components/jds/jd-form-parts";
import { blankToUndefined } from "@/lib/domain/text";
import { useServerFieldError } from "@/hooks/use-server-field-error";

/**
 * The three ways to add a job description. They all feed the *same*
 * `POST /api/v1/jds/` multipart endpoint (see lib/api/jds.ts) with different
 * fields set. Validation here is UX only — the backend
 * (`app/services/jd_service.py`) is the source of truth and enforces that
 * exactly one of text/url/file is usable.
 *
 * Each form is a `JdCreateForm` that owns its fields and validation and
 * reports through the same narrow props (like `RoleCreateForm`), so the sheet
 * can host any of them interchangeably: add a mode = add a form + a registry row.
 */

export type JdMode = "text" | "url" | "file";

export interface JdCreateFormProps {
  onSubmit: (input: CreateJdInput) => Promise<unknown>;
  isPending: boolean;
  error: unknown;
  /** Called after a successful submit. */
  onCreated: () => void;
}

export type JdCreateForm = ComponentType<JdCreateFormProps>;

const metaSchema = z.object({
  title: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
});
const textSchema = metaSchema.extend({ text: z.string().min(1, "Paste the job description text") });
const urlSchema = metaSchema.extend({ url: z.string().url("Enter a valid URL") });

type TextValues = z.infer<typeof textSchema>;
type UrlValues = z.infer<typeof urlSchema>;

export const TextJdForm: JdCreateForm = ({ onSubmit, isPending, error, onCreated }) => {
  const form = useForm<TextValues>({ resolver: zodResolver(textSchema) });
  const generalError = useServerFieldError(error, ["text"], ({ field, message }) =>
    form.setError(field as keyof TextValues, { type: "server", message }),
  );
  return (
    <form
      className={FORM_CLASS}
      onSubmit={surfacedElsewhere(
        form.handleSubmit(async (values) => {
          await onSubmit({ mode: "text", ...values });
          form.reset();
          onCreated();
        }),
      )}
    >
      <MetaFields
        idPrefix="jd-text"
        title={form.register("title")}
        company={form.register("company")}
      />
      <FormField
        label="Job description text"
        htmlFor="jd-text-text"
        error={form.formState.errors.text?.message}
        required
      >
        <Textarea
          id="jd-text-text"
          rows={10}
          placeholder="Paste the full job posting text here…"
          {...form.register("text")}
        />
      </FormField>
      <ErrorMessage error={generalError} />
      <FormActions
        isPending={isPending}
        testId="create-jd-submit-text"
        idleLabel="Add job description"
        pendingLabel="Adding…"
      />
    </form>
  );
};

export const UrlJdForm: JdCreateForm = ({ onSubmit, isPending, error, onCreated }) => {
  const form = useForm<UrlValues>({ resolver: zodResolver(urlSchema) });
  const generalError = useServerFieldError(error, ["url"], ({ field, message }) =>
    form.setError(field as keyof UrlValues, { type: "server", message }),
  );
  return (
    <form
      className={FORM_CLASS}
      onSubmit={surfacedElsewhere(
        form.handleSubmit(async (values) => {
          await onSubmit({ mode: "url", ...values });
          form.reset();
          onCreated();
        }),
      )}
    >
      <MetaFields
        idPrefix="jd-url"
        title={form.register("title")}
        company={form.register("company")}
      />
      <FormField
        label="Job posting URL"
        htmlFor="jd-url-url"
        hint="We fetch and store the posting text"
        error={form.formState.errors.url?.message}
        required
      >
        <Input
          id="jd-url-url"
          placeholder="https://careers.example.com/jobs/123"
          {...form.register("url")}
        />
      </FormField>
      <ErrorMessage error={generalError} />
      <FormActions
        isPending={isPending}
        testId="create-jd-submit-url"
        idleLabel="Fetch and add"
        pendingLabel="Fetching…"
      />
    </form>
  );
};

export const FileJdForm: JdCreateForm = ({ onSubmit, isPending, error, onCreated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Either a client-side "no file chosen" or the backend's message for `file`.
  const [fileMessage, setFileMessage] = useState<string>();
  const generalError = useServerFieldError(error, ["file"], ({ message }) =>
    setFileMessage(message),
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFileMessage(undefined);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setFileMessage("Choose a file to upload");
      return;
    }
    const data = new FormData(e.currentTarget);
    await onSubmit({
      mode: "file",
      file,
      title: blankToUndefined(String(data.get("title") ?? "")),
      company: blankToUndefined(String(data.get("company") ?? "")),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    onCreated();
  }

  return (
    <form onSubmit={surfacedElsewhere(handleSubmit)} className={FORM_CLASS}>
      <MetaFields idPrefix="jd-file" title={{ name: "title" }} company={{ name: "company" }} />
      <FormField
        label="File"
        htmlFor="jd-file-input"
        hint="PDF, DOCX, or plain text"
        error={fileMessage}
        required
      >
        <input
          ref={fileInputRef}
          id="jd-file-input"
          type="file"
          data-testid="jd-file-input"
          className={FILE_INPUT_CLASS}
        />
      </FormField>
      <ErrorMessage error={generalError} />
      <FormActions
        isPending={isPending}
        testId="create-jd-submit-file"
        idleLabel="Upload and add"
        pendingLabel="Uploading…"
      />
    </form>
  );
};

/** Mode → label + form. Key order is the order of the mode switcher. */
export const JD_CREATE_MODES: Record<JdMode, { label: string; Form: JdCreateForm }> = {
  text: { label: "Paste text", Form: TextJdForm },
  url: { label: "Paste URL", Form: UrlJdForm },
  file: { label: "Upload file", Form: FileJdForm },
};
