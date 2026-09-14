"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "cn";

/**
 * Shared drag handle + row wrapper for every reorderable list in the
 * profile editor (roles, groups, bullets, skills, education) — one
 * `@dnd-kit/sortable` `useSortable()` integration reused everywhere instead
 * of four bespoke ones. Verified against the installed @dnd-kit/sortable
 * 10.0.0 + @dnd-kit/core 6.3.1 (current stable releases as of this writing)
 * — `useSortable({id})` returning `{attributes, listeners, setNodeRef,
 * transform, transition}` and `CSS.Transform.toString()` for the drag
 * transform are that version's real, current API (checked against the
 * package's shipped `.d.ts`), not assumed from memory.
 */
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-1.5",
        isDragging && "z-10 opacity-70",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="text-muted-foreground hover:text-foreground mt-2 shrink-0 cursor-grab touch-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
