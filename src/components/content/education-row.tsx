"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EditorCard } from "@/components/ui/editor-card";
import { FormField } from "@/components/ui/form-field";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";

const editSchema = z.object({ text: z.string().min(1, "Text is required").max(500) });
type EditValues = z.infer<typeof editSchema>;

export function EducationRow({
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
  } = useForm<EditValues>({ resolver: zodResolver(editSchema), defaultValues: { text } });

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
        className="space-y-4"
      >
        <FormField label="Entry" htmlFor={fieldId} error={errors.text?.message} required>
          <Textarea
            id={fieldId}
            aria-invalid={errors.text ? true : undefined}
            {...register("text")}
          />
        </FormField>

        <ErrorMessage error={saveError} />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </EditorCard>
  );
}
