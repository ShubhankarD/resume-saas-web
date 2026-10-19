"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/content/error-message";
import { roleFieldsSchema } from "@/lib/domain/content-forms";
import { surfacedElsewhere } from "@/lib/form-submit";
import type { RoleIn, RoleUpdate } from "@/lib/api/content";

/** Edit a role's title / organization / dates. */
export function RoleDetailsForm({
  role,
  onSave,
  error,
}: {
  role: RoleIn;
  /** Rejects on failure; the caller shows that failure through `error`. */
  onSave: (body: RoleUpdate) => Promise<unknown>;
  error?: unknown;
}) {
  const fieldId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RoleUpdate>({
    resolver: zodResolver(roleFieldsSchema),
    defaultValues: { title: role.title, org: role.org, dates: role.dates },
  });

  return (
    <form onSubmit={surfacedElsewhere(handleSubmit(onSave))} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Title"
          htmlFor={`${fieldId}-title`}
          error={errors.title?.message}
          required
        >
          <Input
            id={`${fieldId}-title`}
            placeholder="Senior Consultant"
            aria-invalid={errors.title ? true : undefined}
            {...register("title")}
          />
        </FormField>

        <FormField
          label="Organization"
          htmlFor={`${fieldId}-org`}
          error={errors.org?.message}
          required
        >
          <Input
            id={`${fieldId}-org`}
            placeholder="Acme Corp"
            aria-invalid={errors.org ? true : undefined}
            {...register("org")}
          />
        </FormField>

        <FormField
          label="Dates"
          htmlFor={`${fieldId}-dates`}
          error={errors.dates?.message}
          required
          hint="Free text, e.g. “Jan 2024 – Present”."
        >
          <Input
            id={`${fieldId}-dates`}
            placeholder="2020--Present"
            aria-invalid={errors.dates ? true : undefined}
            {...register("dates")}
          />
        </FormField>
      </div>

      <ErrorMessage error={error} />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
