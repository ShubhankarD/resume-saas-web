import { Controller, type Control, type FieldPathByValue, type FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { AiActionChip, AI_BULLET_ACTIONS } from "@/components/ui/ai-action-chip";
import { TagInput } from "@/components/content/tag-input";

/**
 * The three AI rewrite affordances from the design spec.
 *
 * There is no rewrite endpoint in `src/lib/api/content.ts` yet, so these are
 * deliberately presentational: disabled, with a tooltip explaining why. When
 * a backend action lands, wire each chip's `onClick` to a
 * `rewriteBullet(action.id, text)` handler here and drop the `disabled` /
 * `title` props.
 */
export function AiBulletActions() {
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

export function BulletTagsField<T extends FieldValues>({
  control,
  name,
  id,
  hint,
}: {
  control: Control<T>;
  /** The form's `string[]` field holding the tags. */
  name: FieldPathByValue<T, string[]>;
  id: string;
  hint?: string;
}) {
  return (
    <FormField label="Tags" htmlFor={id} hint={hint}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TagInput id={id} value={field.value ?? []} onChange={field.onChange} />
        )}
      />
    </FormField>
  );
}

export function VariantGroupField({
  id,
  hint,
  inputProps,
}: {
  id: string;
  hint: string;
  inputProps: React.ComponentProps<typeof Input>;
}) {
  return (
    <FormField label="Variant group" htmlFor={id} hint={hint}>
      <Input id={id} placeholder="e.g. ship_variant" {...inputProps} />
    </FormField>
  );
}
