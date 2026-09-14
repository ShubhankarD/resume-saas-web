"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <Field label="Id" error={errors.id?.message}>
        <Input placeholder="acme-2022" {...register("id")} />
      </Field>
      <Field label="Title" error={errors.title?.message}>
        <Input placeholder="Senior Engineer" {...register("title")} />
      </Field>
      <Field label="Organization" error={errors.org?.message}>
        <Input placeholder="Acme Corp" {...register("org")} />
      </Field>
      <Field label="Dates" error={errors.dates?.message}>
        <Input placeholder="2020--Present" {...register("dates")} />
      </Field>
      <div className="sm:col-span-2">
        <ErrorMessage error={error} />
      </div>
      <Button type="submit" disabled={isSubmitting} className="self-start sm:col-span-2">
        {isSubmitting ? "Adding…" : "Add role"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
