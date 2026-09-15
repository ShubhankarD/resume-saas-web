"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FileText } from "lucide-react";
import { ErrorMessage } from "@/components/content/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import { DEFAULT_ZOOM, PreviewToolbar, type ZoomLevel } from "@/components/profiles/preview-toolbar";
import { cn } from "cn";

/**
 * US Letter at 96dpi — 8.5in × 11in. Using the real print dimensions is what
 * keeps the sheet's proportion exact (blueprint §27 asks for ~800px wide,
 * ~1050px tall, "do not distort aspect ratio"); 816 × 1056 hits both targets
 * *and* is a true letter page, where a rounded 800 × 1050 would not be.
 */
const SHEET_WIDTH = 816;
const SHEET_HEIGHT = 1056;

/**
 * The right-hand pane of the split-screen editor (the Kickresume/Teal
 * pattern from plans/README.md): an `<iframe srcDoc>` rendering whatever
 * HTML the debounced autosave-then-preview cycle in
 * profiles/[id]/page.tsx last fetched from `POST /profiles/{id}/preview`.
 * `srcDoc` (not `src`) because the HTML is an in-memory string, not a URL —
 * no extra request, and it re-renders instantly on every prop change.
 *
 * The document's own markup and typography are produced by the backend
 * renderer, so this component only owns the *frame*: the document workspace
 * backdrop, the white letter-proportioned sheet, and the zoom transform.
 * Nothing is ever injected into the iframe — blueprint §29 (resume
 * typography) has to be satisfied by the backend template, not from here.
 *
 * Zoom is local UI state and deliberately never reaches the profile draft.
 */
export function LivePreview({
  html,
  isLoading,
  error,
  status,
  className,
}: {
  html: string;
  isLoading: boolean;
  error: unknown;
  /** Secondary status row under the header (e.g. the latest PDF link). */
  status?: ReactNode;
  className?: string;
}) {
  const [zoom, setZoom] = useState<ZoomLevel>(DEFAULT_ZOOM);

  // The sheet is a fixed-size letter page that is *scaled*, never reflowed —
  // reflowing would change the backend document's own layout instead of
  // magnifying it. `fitScale` shrinks it to whatever width the workspace
  // actually has (the 375px case), and the user's zoom multiplies on top.
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    const el = measureRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const available = el.clientWidth;
      if (available > 0) setFitScale(Math.min(1, available / SHEET_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = fitScale * zoom;

  return (
    <div
      className={cn(
        "flex h-[70vh] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.12)] lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-5 dark:border-slate-800 dark:bg-slate-900/85">
        <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Resume preview
        </p>
        <span
          aria-live="polite"
          className="text-xs text-slate-500 tabular-nums dark:text-slate-400"
        >
          {isLoading ? "Updating…" : ""}
        </span>
      </div>

      {status || error ? (
        <div className="space-y-2 border-b border-slate-200/80 px-4 py-3 sm:px-5 dark:border-slate-800">
          <ErrorMessage error={error} />
          {status}
        </div>
      ) : null}

      {/* Document workspace: a calm cool-gray backdrop so the sheet reads as paper. */}
      <div className="flex-1 overflow-auto bg-slate-100/70 p-4 sm:p-6 dark:bg-slate-950">
        <div ref={measureRef} className="flex w-full justify-center">
          {html ? (
            // Outer box reserves the *scaled* footprint so the workspace
            // scrolls correctly and the page is never clipped or squashed.
            <div
              className="shrink-0 transition-[width,height] duration-200"
              style={{ width: SHEET_WIDTH * scale, height: SHEET_HEIGHT * scale }}
            >
              {/* The sheet stays white in dark mode — never filter or darken it. */}
              <iframe
                title="Resume preview"
                srcDoc={html}
                data-testid="preview-iframe"
                className="block rounded-sm border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08),0_16px_40px_-16px_rgba(15,23,42,0.28)] print:border-none print:shadow-none"
                style={{
                  width: SHEET_WIDTH,
                  height: SHEET_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={isLoading ? "Rendering preview…" : "No preview yet"}
              description={
                isLoading
                  ? "Your resume is being typeset — this takes a moment."
                  : "Fill in your details and your resume will appear here automatically."
              }
              className="my-auto border-slate-300/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40"
            />
          )}
        </div>
      </div>

      <PreviewToolbar zoom={zoom} onZoomChange={setZoom} />
    </div>
  );
}
