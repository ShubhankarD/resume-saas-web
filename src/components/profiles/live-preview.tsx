"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/content/error-message";

/**
 * The right-hand pane of the split-screen editor (the Kickresume/Teal
 * pattern from plans/README.md): a scaled `<iframe srcDoc>` rendering
 * whatever HTML the debounced autosave-then-preview cycle in
 * profiles/[id]/page.tsx last fetched from `POST /profiles/{id}/preview`.
 * `srcDoc` (not `src`) because the HTML is an in-memory string, not a URL —
 * no extra request, and it re-renders instantly on every prop change.
 */
export function LivePreview({
  html,
  isLoading,
  error,
}: {
  html: string;
  isLoading: boolean;
  error: unknown;
}) {
  return (
    <Card className="sticky top-4 flex h-[calc(100vh-6rem)] flex-col">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Live preview</CardTitle>
        {isLoading && <span className="text-muted-foreground text-xs">Updating…</span>}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ErrorMessage error={error} />
        <div className="bg-muted h-full w-full overflow-auto rounded-lg">
          {html ? (
            <iframe
              title="Resume preview"
              srcDoc={html}
              data-testid="preview-iframe"
              className="h-full min-h-[900px] w-full origin-top-left rounded-lg border-0 bg-white"
            />
          ) : (
            <p className="text-muted-foreground p-4 text-sm">
              {isLoading ? "Rendering preview…" : "No preview yet."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
