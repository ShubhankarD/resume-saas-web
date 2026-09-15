"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus } from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { upsertEducation, deleteEducation } from "@/lib/api/content";
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
  id: z
    .string()
    .min(1, "Id is required")
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  text: z.string().min(1, "Text is required").max(500),
});
const editSchema = z.object({ text: z.string().min(1, "Text is required").max(500) });

export default function EducationPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contentQueryKey });
  const fieldId = useId();
  const [addOpen, setAddOpen] = useState(false);

  const upsertMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => upsertEducation(id, { text }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEducation(id),
    onSuccess: invalidate,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ id: string; text: string }>({ resolver: zodResolver(createSchema) });

  const header = (action?: React.ReactNode) => (
    <PageHeader
      eyebrow="Content library"
      title="Education"
      description="Degrees, certifications, and training. Each entry has its own id so resumes can reference it directly."
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
        <NoContentRecord section="your education" />
      </div>
    );

  return (
    <div className="space-y-8">
      {header(
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger
            render={
              <Button variant="cta">
                <Plus aria-hidden="true" className="size-4" />
                Add entry
              </Button>
            }
          />
          <SheetContent className="max-w-lg">
            <SheetHeader>
              <SheetTitle>Add an education entry</SheetTitle>
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
                label="Entry id"
                htmlFor={`${fieldId}-id`}
                error={errors.id?.message}
                required
                hint="Lowercase letters, numbers, - or _ — e.g. “bs-cs”."
              >
                <Input
                  id={`${fieldId}-id`}
                  placeholder="bs-cs"
                  aria-invalid={errors.id ? true : undefined}
                  {...register("id")}
                />
              </FormField>

              <FormField
                label="Entry"
                htmlFor={`${fieldId}-text`}
                error={errors.text?.message}
                required
              >
                <Textarea
                  id={`${fieldId}-text`}
                  placeholder="BS Computer Science, Somewhere University"
                  aria-invalid={errors.text ? true : undefined}
                  {...register("text")}
                />
              </FormField>

              <ErrorMessage error={upsertMutation.error} />

              <Button type="submit" variant="cta" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add entry"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>,
      )}

      {content.education.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education added yet"
          description="Add degrees, bootcamps, or certifications — anything you want available to put on a resume."
          action={
            <Button variant="cta" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Add your first entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {content.education.map((entry) => (
            <EducationRow
              key={entry.id}
              id={entry.id}
              text={entry.text}
              onSave={(text) => upsertMutation.mutateAsync({ id: entry.id, text })}
              onDelete={() => deleteMutation.mutate(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EducationRow({
  id,
  text,
  onSave,
  onDelete,
}: {
  id: string;
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
      meta={id}
      actions={<ConfirmDeleteButton label={`education entry ${id}`} onConfirm={onDelete} />}
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
        <FormField label="Entry" htmlFor={fieldId} error={errors.text?.message} required>
          <Textarea
            id={fieldId}
            aria-invalid={errors.text ? true : undefined}
            {...register("text")}
          />
        </FormField>

        <ErrorMessage error={saveError} />

        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save entry"}
        </Button>
      </form>
    </EditorCard>
  );
}
