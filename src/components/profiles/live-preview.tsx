"use client";

import { useState, type ReactNode } from "react";
import { FileText } from "lucide-react";
import { ErrorMessage } from "@/components/content/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { DEFAULT_ZOOM, PreviewToolbar, type ZoomLevel } from "@/components/profiles/preview-toolbar";
import { cn } from "cn";

/**
 * The right-hand pane of the split-screen editor (the Kickresume/Teal
 * pattern from plans/README.md): an `<iframe srcDoc>` rendering whatever
 * HTML the debounced autosave-then-preview cycle in
 * profiles/[id]/page.tsx last fetched from `POST /profiles/{id}/preview`.
 * `srcDoc` (not `src`) because the HTML is an in-memory string, not a URL —
 * no extra request, and it re-renders instantly on every prop change.
 *
 * The document's own markup and typography are produced by the backend
 * renderer, so this component only owns the *frame*: a document workspace
 * backdrop, the white letter-proportioned sheet, and the zoom transform.
 * Zoom is local UI state and deliberately never reaches the profile draft.
 */
export function LivePreview({
  html,
  isLoading,
  error,
  exportAction,
  status,
  className,
}: {
  html: string;
  isLoading: boolean;
  error: unknown;
  /** Primary export action rendered in the toolbar. */
  exportAction?: ReactNode;
  /** Secondary status row under the toolbar (e.g. the latest PDF link). */
  status?: ReactNode;
  className?: string;
}) {
  const [zoom, setZoom] = useState<ZoomLevel>(DEFAULT_ZOOM);

  return (
    <div
      className={cn(
        "flex h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <PreviewToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        isUpdating={isLoading}
        action={exportAction}
        className="sticky top-0 z-10"
      />

      {status || error ? (
        <div className="space-y-2 border-b border-slate-200/80 px-4 py-3 sm:px-5 dark:border-slate-800">
          <ErrorMessage error={error} />
          {status}
        </div>
      ) : null}

      {/* Document workspace: a calm backdrop so the white sheet reads as paper. */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-slate-100/80 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
        {html ? (
          <div
            className="w-full max-w-[800px] shrink-0 transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            {/* The sheet stays white in dark mode — never filter or darken it. */}
            <iframe
              title="Resume preview"
              srcDoc={html}
              data-testid="preview-iframe"
              className="block h-[1050px] w-full rounded-sm border border-slate-200/60 bg-white shadow-2xl print:border-none print:shadow-none"
            />
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={isLoading ? "Rendering preview…" : "No preview yet"}
            description={
              isLoading
                ? "Your resume is being typeset — this takes a moment."
                : "Fill in your details on the left and your resume will appear here automatically."
            }
            className="my-auto border-slate-300/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40"
          />
        )}
      </div>
    </div>
  );
}
