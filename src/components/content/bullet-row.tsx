"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";
import {
  AiBulletActions,
  BulletTagsField,
  VariantGroupField,
} from "@/components/content/bullet-fields";
import { bulletSchema, toBulletBody, type BulletFormValues } from "@/lib/domain/content-forms";
import type { BulletIn, BulletUpdate } from "@/lib/api/content";

export function BulletRow({
  bullet,
  onUpdate,
  onDelete,
}: {
  bullet: BulletIn;
  onUpdate: (body: BulletUpdate) => Promise<unknown>;
  onDelete: () => void;
}) {
  const fieldId = useId();
  const [editing, setEditing] = useState(false);
  // Per-row: every row in a group shares one update mutation, so its error
  // cannot say which row failed.
  const [updateError, setUpdateError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BulletFormValues>({
    resolver: zodResolver(bulletSchema),
    defaultValues: {
      text: bullet.text,
      tags: bullet.tags,
      variant_group: bullet.variant_group ?? "",
    },
  });

  if (!editing) {
    return (
      <li className="group/bullet flex items-start gap-3 py-3 transition-colors duration-150">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="text-sm leading-6 text-slate-800 dark:text-slate-200">{bullet.text}</p>
          {(bullet.tags.length > 0 || bullet.variant_group) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {bullet.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {bullet.variant_group && (
                <Badge variant="outline">variant: {bullet.variant_group}</Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit bullet"
            onClick={() => setEditing(true)}
            className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Button>
          <ConfirmDeleteButton label="this bullet" onConfirm={onDelete} />
        </div>
      </li>
    );
  }

  return (
    <li className="py-4">
      <form
        onSubmit={handleSubmit(async (values) => {
          setUpdateError(null);
          try {
            await onUpdate(toBulletBody(values));
            setEditing(false);
          } catch (err) {
            setUpdateError(err);
          }
        })}
        className="space-y-4"
      >
        <div>
          <FormField label="Bullet" htmlFor={`${fieldId}-text`} error={errors.text?.message}>
            <Textarea
              id={`${fieldId}-text`}
              aria-invalid={errors.text ? true : undefined}
              {...register("text")}
            />
          </FormField>
          <AiBulletActions />
        </div>

        <BulletTagsField
          control={control}
          name="tags"
          id={`${fieldId}-tags`}
          hint="Used to match this bullet against a job description."
        />

        <VariantGroupField
          id={`${fieldId}-variant`}
          hint="Optional — bullets sharing a group are alternates of each other."
          inputProps={register("variant_group")}
        />

        <ErrorMessage error={updateError} />

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save bullet"}
          </Button>
        </div>
      </form>
    </li>
  );
}
