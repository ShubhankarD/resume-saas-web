"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/content/error-message";
import {
  AiBulletActions,
  BulletTagsField,
  VariantGroupField,
} from "@/components/content/bullet-fields";
import {
  EMPTY_BULLET_CREATE,
  bulletCreateSchema,
  toBulletCreateBody,
  type BulletCreateFormValues,
} from "@/lib/domain/content-forms";
import { surfacedElsewhere } from "@/lib/form-submit";
import type { BulletCreate } from "@/lib/api/content";

export function BulletCreateForm({
  onSubmit,
  error,
  onCancel,
}: {
  /** Rejects on failure; the caller shows that failure through `error`. */
  onSubmit: (values: BulletCreate) => Promise<unknown>;
  error?: unknown;
  /** Optional — renders a Cancel control beside the submit button. */
  onCancel?: () => void;
}) {
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BulletCreateFormValues>({
    resolver: zodResolver(bulletCreateSchema),
    defaultValues: EMPTY_BULLET_CREATE,
  });

  return (
    <form
      onSubmit={surfacedElsewhere(
        handleSubmit(async (values) => {
          await onSubmit(toBulletCreateBody(values));
          reset(EMPTY_BULLET_CREATE);
        }),
      )}
      className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800"
    >
      <div>
        <FormField
          label="Accomplishment"
          htmlFor={`${fieldId}-text`}
          error={errors.text?.message}
          hint="Lead with the outcome, then how you got there."
        >
          <Textarea
            id={`${fieldId}-text`}
            placeholder="Shipped a thing that mattered."
            aria-invalid={errors.text ? true : undefined}
            {...register("text")}
          />
        </FormField>
        <AiBulletActions />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Bullet id"
          htmlFor={`${fieldId}-id`}
          error={errors.id?.message}
          required
          hint="Lowercase letters, numbers, - or _"
        >
          <Input
            id={`${fieldId}-id`}
            placeholder="bullet-id"
            aria-invalid={errors.id ? true : undefined}
            {...register("id")}
          />
        </FormField>

        <VariantGroupField
          id={`${fieldId}-variant`}
          hint="Optional."
          inputProps={register("variant_group")}
        />
      </div>

      <BulletTagsField control={control} name="tags" id={`${fieldId}-tags`} />

      <ErrorMessage error={error} />

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={isSubmitting}>
          <Plus aria-hidden="true" className="size-3.5" />
          {isSubmitting ? "Adding…" : "Add bullet"}
        </Button>
      </div>
    </form>
  );
}
