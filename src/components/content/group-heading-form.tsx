"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/content/error-message";
import { groupUpdateSchema, type GroupUpdateFormValues } from "@/lib/domain/content-forms";
import { blankToUndefined } from "@/lib/domain/text";
import { surfacedElsewhere } from "@/lib/form-submit";

export function GroupHeadingForm({
  heading,
  onSave,
  error,
}: {
  heading: string | null | undefined;
  /** Rejects on failure; the caller shows that failure through `error`. */
  onSave: (heading: string | undefined) => Promise<unknown>;
  error?: unknown;
}) {
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<GroupUpdateFormValues>({
    resolver: zodResolver(groupUpdateSchema),
    defaultValues: { heading: heading ?? "" },
  });

  return (
    <form
      onSubmit={surfacedElsewhere(
        handleSubmit((values) => onSave(blankToUndefined(values.heading))),
      )}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto]">
        <FormField
          label="Group heading"
          htmlFor={`${fieldId}-heading`}
          hint="Optional — shown above this group's bullets on the resume."
        >
          <Input
            id={`${fieldId}-heading`}
            placeholder="e.g. Platform modernisation"
            {...register("heading")}
          />
        </FormField>
        <Button type="submit" variant="outline" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save heading"}
        </Button>
      </div>
      <ErrorMessage error={error} />
    </form>
  );
}
