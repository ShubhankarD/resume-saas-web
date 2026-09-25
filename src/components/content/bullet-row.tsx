"use client";

import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { AiActionChip, AI_BULLET_ACTIONS } from "@/components/ui/ai-action-chip";
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

/**
 * The three AI rewrite affordances from the design spec.
 *
 * There is no rewrite endpoint in `src/lib/api/content.ts` yet, so these are
 * deliberately presentational: disabled, with a tooltip explaining why. When
 * a backend action lands, wire each chip's `onClick` to a
 * `rewriteBullet(action.id, text)` handler here and in `BulletCreateForm`
 * below, and drop the `disabled` / `title` props.
 */
function AiBulletActions() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {AI_BULLET_ACTIONS.map((action) => (
        // TODO: wire to a real rewrite handler (see AiBulletActions doc comment).
        <span key={action.id} title={`${action.label} — AI rewrites are coming soon.`}>
          <AiActionChip label={action.label} className="h-7" disabled />
        </span>
      ))}
      <span className="text-xs text-slate-500 dark:text-slate-400">Coming soon</span>
    </div>
  );
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
  const fieldId = useId();
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

        <FormField
          label="Tags"
          htmlFor={`${fieldId}-tags`}
          hint="Used to match this bullet against a job description."
        >
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                id={`${fieldId}-tags`}
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>

        <FormField
          label="Variant group"
          htmlFor={`${fieldId}-variant`}
          hint="Optional — bullets sharing a group are alternates of each other."
        >
          <Input
            id={`${fieldId}-variant`}
            placeholder="e.g. ship_variant"
            {...register("variant_group")}
          />
        </FormField>

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
  onCancel,
}: {
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

        <FormField label="Variant group" htmlFor={`${fieldId}-variant`} hint="Optional.">
          <Input
            id={`${fieldId}-variant`}
            placeholder="e.g. ship_variant"
            {...register("variant_group")}
          />
        </FormField>
      </div>

      <FormField label="Tags" htmlFor={`${fieldId}-tags`}>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagInput id={`${fieldId}-tags`} value={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </FormField>

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
