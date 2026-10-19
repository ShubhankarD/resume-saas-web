import { Badge } from "@/components/ui/badge";
import { AI_BULLET_ACTIONS, AiActionChip } from "@/components/ui/ai-action-chip";
import { Textarea } from "@/components/ui/textarea";
import type { ContentIn } from "@/lib/api/content";
import { SortableGrip } from "@/components/profiles/sortable-row";
import { CHECKBOX_CLASS } from "@/components/profiles/editor-styles";

type BulletIn = ContentIn["experience"][number]["groups"][number]["bullets"][number];

export function IncludedBullet({
  bullet,
  position,
  overrideText,
  onExclude,
  onOverride,
}: {
  bullet: BulletIn;
  position: number;
  overrideText: string | undefined;
  onExclude: () => void;
  onOverride: (value: string) => void;
}) {
  const textareaId = `bullet-text-${bullet.id}`;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 transition-colors duration-150 hover:border-slate-300 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <SortableGrip label={`Reorder bullet ${position}`} className="-ml-1.5" />

        <label className="inline-flex h-8 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked
            onChange={onExclude}
            aria-label={`Include bullet ${bullet.id}`}
          />
          Included
        </label>

        {(bullet.tags.length > 0 || bullet.variant_group) && (
          <div className="ml-auto flex flex-wrap justify-end gap-1.5">
            {bullet.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {bullet.variant_group && (
              <Badge variant="outline">variant: {bullet.variant_group}</Badge>
            )}
          </div>
        )}
      </div>

      <label htmlFor={textareaId} className="sr-only">
        Bullet text
      </label>
      <Textarea
        id={textareaId}
        defaultValue={overrideText ?? bullet.text}
        className="min-h-[72px]"
        onBlur={(e) => onOverride(e.target.value)}
      />

      {/*
        Presentational only: there is no AI bullet-rewrite endpoint yet, so these
        chips deliberately make no request. TODO: wire each chip's onClick to an
        `onAiAction(bullet.id, action.id)` handler once a rewrite endpoint and its
        React Query mutation hook exist.
      */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {AI_BULLET_ACTIONS.map((action) => (
          <span key={action.id} title="AI rewrite suggestions are coming soon">
            <AiActionChip label={action.label} disabled className="h-7" />
          </span>
        ))}
      </div>
    </div>
  );
}
