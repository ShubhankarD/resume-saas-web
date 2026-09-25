"use client";

import { useState } from "react";
import { FileClock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useBuilds, useCreateBuild, useDeleteBuild } from "@/hooks/use-builds";
import type { BuildResponse } from "@/lib/api/builds";

/**
 * `POST /api/v1/builds/` is fully synchronous on the backend (see
 * lib/api/builds.ts's docstring) — it awaits two real headless-Chromium
 * passes (`measure_fill`) plus a Playwright PDF conversion inside the
 * request handler, so by the time the mutation resolves, `status` is
 * already `"completed"` or `"failed"`. There is no polling loop here; the
 * export button just stays disabled/labeled "Building…" for whatever the
 * real wall-clock time turns out to be.
 *
 * This is the single export implementation for the editor: the preview
 * toolbar's "Export PDF" button drives `run()` and renders `lastBuild`.
 */
export function useResumeExport({
  profileId,
  ensureSaved,
}: {
  profileId: string;
  ensureSaved: () => Promise<void>;
}) {
  const createBuild = useCreateBuild();
  const [lastBuild, setLastBuild] = useState<BuildResponse | null>(null);
  const [buildError, setBuildError] = useState<unknown>(null);

  async function run() {
    setBuildError(null);
    try {
      await ensureSaved();
      const build = await createBuild.mutateAsync({ profile_id: profileId, keep_html: false });
      setLastBuild(build);
      if (build.status !== "completed") {
        setBuildError(new Error(`Build finished with status "${build.status}"`));
      }
    } catch (err) {
      setBuildError(err);
    }
  }

  return { run, isPending: createBuild.isPending, lastBuild, buildError };
}

/** The download link for the most recent successful export, if any. */
export function LatestPdfLink({ build }: { build: BuildResponse | null }) {
  if (build?.status !== "completed" || !build.pdf_url) return null;
  return (
    <a
      href={build.pdf_url}
      target="_blank"
      rel="noreferrer"
      data-testid="latest-pdf-link"
      className="focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-blue-700 underline underline-offset-4 outline-none hover:text-blue-800 focus-visible:ring-3 dark:text-blue-300 dark:hover:text-blue-200"
    >
      Open latest PDF ({build.page_count} page{build.page_count === 1 ? "" : "s"},{" "}
      {Math.round(build.fill_pct ?? 0)}% fill)
    </a>
  );
}

/**
 * Past exports for this profile. `GET /api/v1/builds/` is a flat
 * tenant-wide list, so it is filtered client-side by `profile_id` (see
 * use-builds.ts). Lower-value than exporting, so the editor tucks it
 * behind a drawer rather than the primary column.
 */
export function BuildHistory({ profileId }: { profileId: string }) {
  const { data: builds } = useBuilds();
  const deleteBuild = useDeleteBuild();

  const history = (builds ?? []).filter((b) => b.profile_id === profileId);

  if (history.length === 0) {
    return (
      <EmptyState
        icon={FileClock}
        title="No exports yet"
        description="Every PDF you export from this profile is kept here so you can download it again."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {history.map((build) => (
        <li
          key={build.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {new Date(build.created_at).toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {build.status}
              {build.page_count != null ? ` · ${build.page_count} page${build.page_count === 1 ? "" : "s"}` : ""}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete build"
            className="shrink-0"
            onClick={() => deleteBuild.mutate(build.id)}
          >
            <Trash2 aria-hidden="true" className="text-destructive size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
