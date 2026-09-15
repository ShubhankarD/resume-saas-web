"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wrench } from "lucide-react";
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

export default function SkillsPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contentQueryKey });
  const fieldId = useId();
  const [addOpen, setAddOpen] = useState(false);

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

  const header = (action?: React.ReactNode) => (
    <PageHeader
      eyebrow="Content library"
      title="Skills"
      description="Skills grouped the way they should read on a resume — a label, and the comma-separated skills behind it."
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
        <NoContentRecord section="your skills" />
      </div>
    );

  const entries = Object.entries(content.skills);

  return (
    <div className="space-y-8">
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
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
          description="Group related skills under a label — “Cloud & Infrastructure”, “Languages” — so a resume can show the ones that fit the job."
          action={
            <Button variant="cta" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Add your first group
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {entries.map(([key, group]) => (
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

  return (
    <EditorCard
      title={label}
      subtitle={text}
      meta={skillKey}
      actions={<ConfirmDeleteButton label={`skill group ${label}`} onConfirm={onDelete} />}
    >
      <form
        onSubmit={handleSubmit(async (values) => {
          setSaveError(null);
          try {
            await onSave(values);
          } catch (err) {
            setSaveError(err);
          }
        })}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
          >
            <Input
              id={`${fieldId}-text`}
              aria-invalid={errors.text ? true : undefined}
              {...register("text")}
            />
          </FormField>
        </div>

        <ErrorMessage error={saveError} />

        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save skill group"}
        </Button>
      </form>
    </EditorCard>
  );
}
