"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/content/error-message";
import {
  groupCreateSchema,
  toGroupCreateBody,
  type GroupCreateFormValues,
} from "@/lib/domain/content-forms";
import { surfacedElsewhere } from "@/lib/form-submit";
import type { GroupCreate } from "@/lib/api/content";

export function GroupCreateForm({
  onSubmit,
  onCancel,
  error,
}: {
  /** Rejects on failure; the caller shows that failure through `error`. */
  onSubmit: (body: GroupCreate) => Promise<unknown>;
  onCancel: () => void;
  error?: unknown;
}) {
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupCreateFormValues>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: { id: "", heading: "" },
  });

  return (
    <form
      onSubmit={surfacedElsewhere(
        handleSubmit(async (values) => {
          await onSubmit(toGroupCreateBody(values));
          reset();
        }),
      )}
      className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Group id"
          htmlFor={`${fieldId}-group-id`}
          error={errors.id?.message}
          required
          hint="Lowercase letters, numbers, - or _"
        >
          <Input
            id={`${fieldId}-group-id`}
            placeholder="group-id"
            aria-invalid={errors.id ? true : undefined}
            {...register("id")}
          />
        </FormField>

        <FormField label="Group heading" htmlFor={`${fieldId}-group-heading`} hint="Optional.">
          <Input
            id={`${fieldId}-group-heading`}
            placeholder="e.g. Platform modernisation"
            {...register("heading")}
          />
        </FormField>
      </div>

      <ErrorMessage error={error} />

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add group"}
        </Button>
      </div>
    </form>
  );
}
