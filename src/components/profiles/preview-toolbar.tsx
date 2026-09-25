"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

/** The three zoom steps required by the preview spec. */
export const ZOOM_LEVELS = [0.75, 1, 1.25] as const;

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export const DEFAULT_ZOOM: ZoomLevel = 1;

/**
 * The compact `[ − ] 100% [ + ]` control that sits under the resume sheet
 * (blueprint §28). Export deliberately does NOT live here — it is the one
 * strong CTA in the editor's contextual toolbar, so zoom stays quiet.
 *
 * Zoom is presentation-only — it scales the document surface in
 * `live-preview.tsx` and never touches the profile draft, so it can't
 * trigger the editor's debounced autosave-then-preview cycle.
 */
export function PreviewToolbar({
  zoom,
  onZoomChange,
  className,
}: {
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
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
        "flex h-12 shrink-0 items-center justify-center gap-2 border-t border-slate-200/80 bg-white/85 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 rounded-lg border border-slate-200/80 bg-slate-50/70 p-0.5 dark:border-slate-800 dark:bg-slate-950/40">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Zoom out"
          disabled={!canZoomOut}
          onClick={() => step(-1)}
        >
          <Minus aria-hidden="true" />
        </Button>

        <span
          aria-live="polite"
          className="min-w-12 text-center text-xs font-semibold text-slate-700 tabular-nums dark:text-slate-300"
        >
          {Math.round(zoom * 100)}%
        </span>

        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Zoom in"
          disabled={!canZoomIn}
          onClick={() => step(1)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>

      {/* Optional reset (blueprint §28) — only offered once it would do something. */}
      {zoom !== DEFAULT_ZOOM ? (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onZoomChange(DEFAULT_ZOOM)}
          aria-label="Fit page — reset zoom to 100%"
        >
          Fit
        </Button>
      ) : null}
    </div>
  );
}
