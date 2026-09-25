"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "cn";

/**
 * Shared row wrapper for every reorderable list in the profile editor
 * (roles, groups, bullets, skills, education) — one `@dnd-kit/sortable`
 * `useSortable()` integration reused everywhere instead of four bespoke
 * ones. Verified against the installed @dnd-kit/sortable 10.0.0 +
 * @dnd-kit/core 6.3.1 — `useSortable({id})` returning `{attributes,
 * listeners, setNodeRef, transform, transition}` and
 * `CSS.Transform.toString()` for the drag transform are that version's
 * real API.
 *
 * The row itself carries no drag listeners: they are published through
 * context and attached by `<SortableGrip />`, which the row's content
 * places wherever the design needs it (inside an `EditorCard`'s
 * `dragHandle` slot, in a row's leading gutter, ...). Keeping the
 * listeners on an explicit handle is what stops a drag from also toggling
 * the surrounding collapsible, while the handle staying a real focusable
 * `<button>` carrying dnd-kit's `attributes` keeps keyboard reordering
 * (the `sortableKeyboardCoordinates` sensor) working.
 */

type SortableHandleValue = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
};

const SortableHandleContext = React.createContext<SortableHandleValue | null>(null);

export function SortableRow({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle = React.useMemo<SortableHandleValue>(
    () => ({ attributes, listeners }),
    [attributes, listeners],
  );

  return (
    <SortableHandleContext.Provider value={handle}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group/sortable-row relative min-w-0",
          isDragging && "z-10 opacity-80 [&_*]:cursor-grabbing",
          className,
        )}
      >
        {children}
      </div>
    </SortableHandleContext.Provider>
  );
}

/**
 * The grip affordance for the nearest enclosing `SortableRow`: a 32px
 * pointer target of its own (never the whole row), muted `text-slate-400`
 * until hovered, per the blueprint's drag-handle spec.
 */
export function SortableGrip({
  label = "Drag to reorder",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const handle = React.useContext(SortableHandleContext);
  if (!handle) return null;

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "focus-visible:ring-ring/40 inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-3 active:cursor-grabbing dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300",
        className,
      )}
      {...handle.attributes}
      {...handle.listeners}
    >
      <GripVertical aria-hidden="true" className="size-4" />
    </button>
  );
}
