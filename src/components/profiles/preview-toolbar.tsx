"use client";

import type { ReactNode } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

/** The three zoom steps required by the preview spec. */
export const ZOOM_LEVELS = [0.75, 1, 1.25] as const;

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export const DEFAULT_ZOOM: ZoomLevel = 1;

/**
 * Utility bar above the resume canvas: zoom controls on the left, the
 * high-value export action on the right.
 *
 * Zoom is presentation-only — it scales the document surface in
 * `live-preview.tsx` and never touches the profile draft, so it can't
 * trigger the editor's debounced autosave-then-preview cycle.
 */
export function PreviewToolbar({
  zoom,
  onZoomChange,
  isUpdating = false,
  action,
  className,
}: {
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  /** Shows a quiet "Updating…" hint while a preview request is in flight. */
  isUpdating?: boolean;
  /** The primary export action, rendered as the toolbar's one strong button. */
  action?: ReactNode;
  className?: string;
}) {
  const index = ZOOM_LEVELS.indexOf(zoom);
  const canZoomOut = index > 0;
  const canZoomIn = index >= 0 && index < ZOOM_LEVELS.length - 1;

  function step(delta: -1 | 1) {
    const next = ZOOM_LEVELS[index + delta];
    if (next !== undefined) onZoomChange(next);
  }

  return (
    <div
      data-slot="preview-toolbar"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-5 dark:border-slate-800 dark:bg-slate-900/80",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-0.5 dark:border-slate-800 dark:bg-slate-950/40">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={!canZoomOut}
            onClick={() => step(-1)}
          >
            <ZoomOut aria-hidden="true" />
          </Button>

          <span
            aria-live="polite"
            className="min-w-14 text-center text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300"
          >
            {Math.round(zoom * 100)}%
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={!canZoomIn}
            onClick={() => step(1)}
          >
            <ZoomIn aria-hidden="true" />
          </Button>
        </div>

        {isUpdating ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">Updating…</span>
        ) : null}
      </div>

      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
