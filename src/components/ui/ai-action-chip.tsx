"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "cn";

/**
 * The AI bullet-rewrite actions offered under responsibility/accomplishment
 * textareas. Kept as a single source of truth so every editor offers the same
 * set in the same order.
 */
const AI_BULLET_ACTIONS = [
  { id: "quantify", label: "Quantify impact" },
  { id: "verbs", label: "Fix action verbs" },
  { id: "brevity", label: "Tighten brevity" },
] as const satisfies readonly { id: string; label: string }[];

type AiActionChipProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  pending?: boolean;
  className?: string;
};

/**
 * A lightweight amber AI affordance — deliberately not a primary action.
 */
function AiActionChip({
  label,
  onClick,
  disabled,
  pending,
  className,
}: AiActionChipProps): React.ReactElement {
  return (
    <button
      type="button"
      data-slot="ai-action-chip"
      onClick={onClick}
      disabled={disabled || pending}
      aria-busy={pending ? true : undefined}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors duration-150 outline-none hover:bg-amber-100 focus-visible:ring-3 focus-visible:ring-amber-500/30 disabled:pointer-events-none disabled:opacity-60 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50",
        className,
      )}
    >
      {pending ? (
        <Loader2 aria-hidden="true" className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <Sparkles aria-hidden="true" className="size-3.5 shrink-0" />
      )}
      {label}
    </button>
  );
}

export { AI_BULLET_ACTIONS, AiActionChip };
