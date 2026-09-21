"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";

type EditorCardProps = {
  /** Identifying line, e.g. "Senior Consultant". */
  title: string;
  /** Secondary line, e.g. "PwC · Chicago, IL". */
  subtitle?: string;
  /** Trailing metadata, e.g. "Jan 2024 – Present". */
  meta?: string;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Caller-supplied grip, already wired to its drag listeners. */
  dragHandle?: React.ReactNode;
  /** Row-level actions (delete, duplicate, ...). Never toggles the card. */
  actions?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  /** Expanded editable content. */
  children: React.ReactNode;
};

/** Keeps drag/action clicks from reaching the collapsible trigger. */
function stopAll(event: React.SyntheticEvent): void {
  event.stopPropagation();
}

/**
 * A collapsible resume-section entry card.
 *
 * Collapsed anatomy (64–72px tall): [grip] [title / subtitle · meta] [actions]
 * [chevron]. The expanded body is plain 16px-spaced fields — never nested
 * cards or bordered sub-boxes.
 */
function EditorCard({
  title,
  subtitle,
  meta,
  open,
  defaultOpen,
  onOpenChange,
  dragHandle,
  actions,
  disabled,
  className,
  children,
}: EditorCardProps): React.ReactElement {
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  const metadata = [subtitle, meta].filter(Boolean).join(" · ");

  return (
    <CollapsiblePrimitive.Root
      data-slot="editor-card"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900",
        disabled && "opacity-60",
        className,
      )}
    >
      <div data-slot="editor-card-row" className="flex items-center gap-2">
        {dragHandle ? (
          <div
            data-slot="editor-card-drag-handle"
            onClick={stopAll}
            onPointerDown={stopAll}
            onKeyDown={stopAll}
            className="inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:text-slate-600 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
          >
            {dragHandle}
          </div>
        ) : null}

        <CollapsiblePrimitive.Trigger
          data-slot="editor-card-trigger"
          className="group/editor-card-trigger focus-visible:ring-ring/50 flex min-w-0 flex-1 items-center gap-2 rounded-md text-left transition-colors duration-150 outline-none focus-visible:ring-3 disabled:pointer-events-none"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
              {title}
            </span>
            {metadata ? (
              <span className="mt-0.5 block truncate text-xs leading-5 text-slate-500 dark:text-slate-400">
                {metadata}
              </span>
            ) : null}
          </span>

          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[panel-open]/editor-card-trigger:rotate-180 dark:text-slate-500"
          />
        </CollapsiblePrimitive.Trigger>

        {actions ? (
          <div
            data-slot="editor-card-actions"
            onClick={stopAll}
            onPointerDown={stopAll}
            onKeyDown={stopAll}
            className="flex shrink-0 items-center gap-1"
          >
            {actions}
          </div>
        ) : null}
      </div>

      <CollapsiblePrimitive.Panel
        data-slot="editor-card-content"
        className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
      >
        <div className="space-y-4 pt-4">{children}</div>
      </CollapsiblePrimitive.Panel>
    </CollapsiblePrimitive.Root>
  );
}

export { EditorCard };
