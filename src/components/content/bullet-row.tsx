"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/content/tag-input";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";
import type { BulletIn, BulletUpdate, BulletCreate } from "@/lib/api/content";

/**
 * Zod schemas here deliberately avoid `.transform()` — react-hook-form's
 * generic typing gets awkward when a schema's input and output types
 * diverge (zodResolver ends up with a Resolver whose types don't quite
 * match a single `useForm<T>()` type param). Simpler: keep the form's
 * values as plain strings (an empty `variant_group` input included) and
 * convert `""` -> `undefined` once, right before calling the API.
 */
const bulletSchema = z.object({
  text: z.string().min(1, "Bullet text is required").max(2000),
  tags: z.array(z.string()),
  variant_group: z.string().max(80),
});
type BulletFormValues = z.infer<typeof bulletSchema>;

function toBulletBody(values: BulletFormValues): BulletUpdate {
  return {
    text: values.text,
    tags: values.tags,
    variant_group: values.variant_group.trim() ? values.variant_group.trim() : undefined,
  };
}

export function BulletRow({
  bullet,
  onUpdate,
  onDelete,
}: {
  bullet: BulletIn;
  onUpdate: (body: BulletUpdate) => Promise<unknown>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
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
      <li className="border-border flex items-start justify-between gap-2 rounded-lg border px-3 py-2">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm">{bullet.text}</p>
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
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit bullet"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton label="this bullet" onConfirm={onDelete} />
        </div>
      </li>
    );
  }

  return (
    <li className="border-border rounded-lg border px-3 py-2">
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
        className="flex flex-col gap-2"
      >
        <Label>Text</Label>
        <Textarea {...register("text")} />
        {errors.text && <p className="text-destructive text-xs">{errors.text.message}</p>}
        <ErrorMessage error={updateError} />

        <Label>Tags</Label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} />}
        />

        <Label>Variant group (optional)</Label>
        <Input placeholder="e.g. ship_variant" {...register("variant_group")} />

        <div className="mt-1 flex gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </li>
  );
}

const bulletCreateSchema = z.object({
  id: z
    .string()
    .min(1, "Id is required")
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  text: z.string().min(1, "Bullet text is required").max(2000),
  tags: z.array(z.string()),
  variant_group: z.string().max(80),
});
type BulletCreateFormValues = z.infer<typeof bulletCreateSchema>;

function toBulletCreateBody(values: BulletCreateFormValues): BulletCreate {
  return {
    id: values.id,
    text: values.text,
    tags: values.tags,
    variant_group: values.variant_group.trim() ? values.variant_group.trim() : undefined,
  };
}

export function BulletCreateForm({
  onSubmit,
  error,
}: {
  onSubmit: (values: BulletCreate) => Promise<unknown>;
  error?: unknown;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BulletCreateFormValues>({
    resolver: zodResolver(bulletCreateSchema),
    defaultValues: { id: "", text: "", tags: [], variant_group: "" },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          await onSubmit(toBulletCreateBody(values));
          reset({ id: "", text: "", tags: [], variant_group: "" });
        } catch {
          // Swallowed here: the caller already recorded the error (passed
          // back in via the `error` prop) — this catch only prevents the
          // form from resetting/losing the user's input on failure.
        }
      })}
      className="border-border flex flex-col gap-2 rounded-lg border border-dashed p-3"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr]">
        <div>
          <Input placeholder="bullet-id" {...register("id")} />
          {errors.id && <p className="text-destructive text-xs">{errors.id.message}</p>}
        </div>
        <div>
          <Textarea placeholder="Shipped a thing that mattered." {...register("text")} />
          {errors.text && <p className="text-destructive text-xs">{errors.text.message}</p>}
        </div>
      </div>
      <Controller
        control={control}
        name="tags"
        render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} />}
      />
      <Input placeholder="Variant group (optional)" {...register("variant_group")} />
      <ErrorMessage error={error} />
      <Button type="submit" size="sm" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Adding…" : "Add bullet"}
      </Button>
    </form>
  );
}
