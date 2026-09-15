"use client";

import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Wrench } from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { upsertSkill, deleteSkill } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorCard } from "@/components/ui/editor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";
import { ContentSkeleton, NoContentRecord } from "@/components/content/content-states";

const createSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  label: z.string().min(1, "Label is required").max(100),
  text: z.string().min(1, "Text is required").max(500),
});
const editSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  text: z.string().min(1, "Text is required").max(500),
});
type EditValues = z.infer<typeof editSchema>;

/**
 * A skill group's `text` is one freeform string on the backend
 * (SkillGroupIn), so tokens are a *display* convenience only: we split on
 * commas to show chips, and every edit still writes the whole string back
 * unchanged in shape. Text without commas degrades to a single chip.
 */
function toTokens(text: string): string[] {
  return text
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

export default function SkillsPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contentQueryKey });
  const fieldId = useId();
  const searchId = useId();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const upsertMutation = useMutation({
    mutationFn: ({ key, label, text }: { key: string; label: string; text: string }) =>
      upsertSkill(key, { label, text }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteSkill(key),
    onSuccess: invalidate,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ key: string; label: string; text: string }>({
    resolver: zodResolver(createSchema),
  });

  const entries = useMemo(() => Object.entries(content?.skills ?? {}), [content]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      ([key, group]) =>
        key.toLowerCase().includes(query) ||
        group.label.toLowerCase().includes(query) ||
        group.text.toLowerCase().includes(query),
    );
  }, [entries, search]);

  const header = (action?: React.ReactNode) => (
    <PageHeader
      eyebrow="Content library"
      title="Skills"
      description="Skills grouped the way they read on a resume — a label, and the comma-separated skills behind it."
      action={action}
    />
  );

  if (isLoading)
    return (
      <div className="space-y-6">
        {header()}
        <ContentSkeleton rows={3} />
      </div>
    );
  if (error)
    return (
      <div className="space-y-6">
        {header()}
        <ErrorMessage error={error} />
      </div>
    );
  if (!content)
    return (
      <div className="space-y-6">
        {header()}
        <NoContentRecord section="your skills" />
      </div>
    );

  return (
    <div className="space-y-6">
      {header(
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger
            render={
              <Button variant="cta">
                <Plus aria-hidden="true" className="size-4" />
                Add skill group
              </Button>
            }
          />
          <SheetContent className="max-w-lg">
            <SheetHeader>
              <SheetTitle>Add a skill group</SheetTitle>
            </SheetHeader>
            <form
              onSubmit={handleSubmit(async (values) => {
                await upsertMutation.mutateAsync(values);
                reset();
                setAddOpen(false);
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Key"
                  htmlFor={`${fieldId}-key`}
                  error={errors.key?.message}
                  required
                  hint="Lowercase letters, numbers, - or _"
                >
                  <Input
                    id={`${fieldId}-key`}
                    placeholder="cloud"
                    aria-invalid={errors.key ? true : undefined}
                    {...register("key")}
                  />
                </FormField>

                <FormField
                  label="Label"
                  htmlFor={`${fieldId}-label`}
                  error={errors.label?.message}
                  required
                  hint="Shown on the resume."
                >
                  <Input
                    id={`${fieldId}-label`}
                    placeholder="Cloud & Infrastructure"
                    aria-invalid={errors.label ? true : undefined}
                    {...register("label")}
                  />
                </FormField>
              </div>

              <FormField
                label="Skills"
                htmlFor={`${fieldId}-text`}
                error={errors.text?.message}
                required
                hint="Separate skills with commas."
              >
                <Input
                  id={`${fieldId}-text`}
                  placeholder="GCP, AWS, Terraform"
                  aria-invalid={errors.text ? true : undefined}
                  {...register("text")}
                />
              </FormField>

              <ErrorMessage error={upsertMutation.error} />

              <Button type="submit" variant="cta" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add skill group"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>,
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No skill groups yet"
          description="Group related skills under a label so a resume can show the ones that fit the job."
          action={
            <Button variant="cta" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Add your first group
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <label htmlFor={searchId} className="sr-only">
                Search skills
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <Input
                id={searchId}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills…"
                className="pl-9"
              />
            </div>
            <p
              aria-live="polite"
              className="text-xs text-slate-500 tabular-nums dark:text-slate-400"
            >
              {filtered.length} of {entries.length} {entries.length === 1 ? "group" : "groups"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No matching skill groups"
              description="Nothing here matches that search — try a shorter term."
              action={
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map(([key, group]) => (
                <SkillRow
                  key={key}
                  skillKey={key}
                  label={group.label}
                  text={group.text}
                  onSave={(values) => upsertMutation.mutateAsync({ key, ...values })}
                  onDelete={() => deleteMutation.mutate(key)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkillRow({
  skillKey,
  label,
  text,
  onSave,
  onDelete,
}: {
  skillKey: string;
  label: string;
  text: string;
  onSave: (values: EditValues) => Promise<unknown>;
  onDelete: () => void;
}) {
  const fieldId = useId();
  const [saveError, setSaveError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditValues>({ resolver: zodResolver(editSchema), defaultValues: { label, text } });

  const tokens = toTokens(text);

  return (
    <EditorCard
      title={label}
      subtitle={`${tokens.length} ${tokens.length === 1 ? "skill" : "skills"}`}
      meta={skillKey}
      actions={<ConfirmDeleteButton label={`skill group ${label}`} onConfirm={onDelete} />}
    >
      <div className="space-y-4">
        {tokens.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tokens.map((token, index) => (
              <li
                key={`${token}-${index}`}
                className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
              >
                {token}
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={handleSubmit(async (values) => {
            setSaveError(null);
            try {
              await onSave(values);
            } catch (err) {
              setSaveError(err);
            }
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Label"
              htmlFor={`${fieldId}-label`}
              error={errors.label?.message}
              required
            >
              <Input
                id={`${fieldId}-label`}
                aria-invalid={errors.label ? true : undefined}
                {...register("label")}
              />
            </FormField>

            <FormField
              label="Skills"
              htmlFor={`${fieldId}-text`}
              error={errors.text?.message}
              required
              hint="Separate skills with commas."
            >
              <Input
                id={`${fieldId}-text`}
                aria-invalid={errors.text ? true : undefined}
                {...register("text")}
              />
            </FormField>
          </div>

          <ErrorMessage error={saveError} />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </EditorCard>
  );
}
