import { EditorCard } from "@/components/ui/editor-card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CHECKBOX_CLASS } from "@/components/profiles/editor-styles";
import { SortableGrip, SortableRow } from "@/components/profiles/sortable-row";

/** One selected skill group on a profile: reorderable, with per-resume label/text overrides. */
export function SkillIncludedRow({
  skillKey,
  label,
  text,
  onExclude,
  onOverride,
}: {
  skillKey: string;
  label: string;
  text: string;
  onExclude: () => void;
  onOverride: (field: "label" | "text", value: string) => void;
}) {
  return (
    <SortableRow id={skillKey}>
      <EditorCard
        title={label}
        subtitle={text || undefined}
        meta={skillKey}
        dragHandle={<SortableGrip label={`Reorder ${label}`} />}
        actions={
          <label className="inline-flex h-8 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked
              onChange={onExclude}
              aria-label={`Include ${label} on this resume`}
              data-testid={`skill-include-${skillKey}`}
            />
            <span className="hidden sm:inline">Included</span>
          </label>
        }
      >
        <FormField label="Group label" htmlFor={`skill-label-${skillKey}`}>
          <Input
            id={`skill-label-${skillKey}`}
            defaultValue={label}
            onBlur={(e) => onOverride("label", e.target.value)}
          />
        </FormField>

        <FormField
          label="Skills"
          htmlFor={`skill-text-${skillKey}`}
          hint="Shown as a single line on the resume — keep it scannable."
        >
          <Textarea
            id={`skill-text-${skillKey}`}
            defaultValue={text}
            aria-describedby={`skill-text-${skillKey}-hint`}
            className="min-h-[72px]"
            onBlur={(e) => onOverride("text", e.target.value)}
          />
        </FormField>
      </EditorCard>
    </SortableRow>
  );
}
