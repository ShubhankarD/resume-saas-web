"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Quote } from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { upsertTagline, deleteTagline } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  text: z.string().min(1, "Text is required").max(500),
});
const editSchema = z.object({ text: z.string().min(1, "Text is required").max(500) });

export default function TaglinesPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contentQueryKey });
  const fieldId = useId();
  const [addOpen, setAddOpen] = useState(false);

  const upsertMutation = useMutation({
    mutationFn: ({ key, text }: { key: string; text: string }) => upsertTagline(key, { text }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteTagline(key),
    onSuccess: invalidate,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ key: string; text: string }>({ resolver: zodResolver(createSchema) });

  const header = (action?: React.ReactNode) => (
    <PageHeader
      eyebrow="Content library"
      title="Taglines"
      description="Short positioning statements, keyed by name. A tailored resume picks one to sit under your name."
      action={action}
    />
  );

  if (isLoading)
    return (
      <div className="space-y-8">
        {header()}
        <ContentSkeleton rows={2} />
      </div>
    );
  if (error)
    return (
      <div className="space-y-8">
        {header()}
        <ErrorMessage error={error} />
      </div>
    );
  if (!content)
    return (
      <div className="space-y-8">
        {header()}
        <NoContentRecord section="your taglines" />
      </div>
    );

  const entries = Object.entries(content.taglines);

  return (
    <div className="space-y-8">
      {header(
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger
            render={
              <Button variant="cta">
                <Plus aria-hidden="true" className="size-4" />
                Add tagline
              </Button>
            }
          />
          <SheetContent className="max-w-lg">
            <SheetHeader>
              <SheetTitle>Add a tagline</SheetTitle>
            </SheetHeader>
            <form
              onSubmit={handleSubmit(async (values) => {
                await upsertMutation.mutateAsync(values);
                reset();
                setAddOpen(false);
              })}
              className="space-y-5"
            >
              <FormField
                label="Key"
                htmlFor={`${fieldId}-key`}
                error={errors.key?.message}
                required
                hint="Lowercase letters, numbers, - or _ — e.g. “default”."
              >
                <Input
                  id={`${fieldId}-key`}
                  placeholder="default"
                  aria-invalid={errors.key ? true : undefined}
                  {...register("key")}
                />
              </FormField>

              <FormField
                label="Tagline"
                htmlFor={`${fieldId}-text`}
                error={errors.text?.message}
                required
              >
                <Textarea
                  id={`${fieldId}-text`}
                  placeholder="Cloud platform engineer who turns migrations into products."
                  aria-invalid={errors.text ? true : undefined}
                  {...register("text")}
                />
              </FormField>

              <ErrorMessage error={upsertMutation.error} />

              <Button type="submit" variant="cta" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add tagline"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>,
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={Quote}
          title="No taglines yet"
          description="A tagline is the one-line summary under your name — write a general one, then variants for specific kinds of role."
          action={
            <Button variant="cta" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Add your first tagline
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {entries.map(([key, text]) => (
            <TaglineRow
              key={key}
              taglineKey={key}
              text={text}
              onSave={(newText) => upsertMutation.mutateAsync({ key, text: newText })}
              onDelete={() => deleteMutation.mutate(key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaglineRow({
  taglineKey,
  text,
  onSave,
  onDelete,
}: {
  taglineKey: string;
  text: string;
  onSave: (text: string) => Promise<unknown>;
  onDelete: () => void;
}) {
  const fieldId = useId();
  const [saveError, setSaveError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<{ text: string }>({ resolver: zodResolver(editSchema), defaultValues: { text } });

  return (
    <EditorCard
      title={text}
      meta={taglineKey}
      actions={<ConfirmDeleteButton label={`tagline ${taglineKey}`} onConfirm={onDelete} />}
    >
      <form
        onSubmit={handleSubmit(async (values) => {
          setSaveError(null);
          try {
            await onSave(values.text);
          } catch (err) {
            setSaveError(err);
          }
        })}
        className="space-y-5"
      >
        <FormField label="Tagline" htmlFor={fieldId} error={errors.text?.message} required>
          <Textarea
            id={fieldId}
            aria-invalid={errors.text ? true : undefined}
            {...register("text")}
          />
        </FormField>

        <ErrorMessage error={saveError} />

        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save tagline"}
        </Button>
      </form>
    </EditorCard>
  );
}
