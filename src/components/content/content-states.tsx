import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Shared loading/"nothing here yet" presentation for the content library.
 *
 * Every content sub-page reads the same `useContent()` query, so they share
 * the same three states: loading, no content record at all, and an error.
 * Keeping the skeleton shape here means the list area reserves roughly the
 * same height it will occupy once loaded, so the page does not jump.
 */
export function ContentSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your content…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Shown when the user has no content record yet — every editor sub-page
 * needs one before it can do anything, and the overview is where it is
 * created.
 */
export function NoContentRecord({ section }: { section: string }) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="No content record yet"
      description={`Create your resume content first — then ${section} lives here, ready to edit.`}
      action={
        <Button nativeButton={false} variant="cta" render={<Link href="/content" />}>
          Get started
        </Button>
      }
    />
  );
}
