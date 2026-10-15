"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { pluralize } from "@/lib/domain/plural";
import { toTokens } from "@/lib/domain/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorCard } from "@/components/ui/editor-card";
import { FormField } from "@/components/ui/form-field";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";

const editSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  text: z.string().min(1, "Text is required").max(500),
});
type EditValues = z.infer<typeof editSchema>;

export function SkillRow({
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
      subtitle={pluralize(tokens.length, "skill")}
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
