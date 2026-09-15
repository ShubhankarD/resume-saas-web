"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/content/error-message";
import type { RoleCreate } from "@/lib/api/content";

function makeRoleSchema(existingIds: string[]) {
  return z.object({
    id: z
      .string()
      .min(1, "Id is required")
      .max(80)
      .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _")
      .refine((id) => !existingIds.includes(id), "That id is already used"),
    title: z.string().min(1, "Title is required").max(200),
    org: z.string().min(1, "Organization is required").max(200),
    dates: z.string().min(1, "Dates are required").max(100),
  });
}

export function RoleCreateForm({
  existingIds,
  onSubmit,
  error,
}: {
  existingIds: string[];
  onSubmit: (body: RoleCreate) => Promise<unknown>;
  error?: unknown;
}) {
  const fieldId = useId();
  const schema = makeRoleSchema(existingIds);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleCreate>({ resolver: zodResolver(schema) });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset();
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

        <FormField
          label="Role id"
          htmlFor={`${fieldId}-id`}
          error={errors.id?.message}
          required
          hint="A short unique slug, e.g. “acme-2022”."
        >
          <Input
            id={`${fieldId}-id`}
            placeholder="acme-2022"
            aria-invalid={errors.id ? true : undefined}
            {...register("id")}
          />
        </FormField>
      </div>

      <ErrorMessage error={error} />

      <Button type="submit" variant="cta" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Adding…" : "Add role"}
      </Button>
    </form>
  );
}
