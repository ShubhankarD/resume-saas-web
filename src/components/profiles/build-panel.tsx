"use client";

import { useState } from "react";
import { FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/content/error-message";
import { useBuilds, useCreateBuild, useDeleteBuild } from "@/hooks/use-builds";
import type { BuildResponse } from "@/lib/api/builds";

/**
 * `POST /api/v1/builds/` is fully synchronous on the backend (see
 * lib/api/builds.ts's docstring) — it awaits two real headless-Chromium
 * passes (`measure_fill`) plus a Playwright PDF conversion inside the
 * request handler, so by the time the mutation resolves, `status` is
 * already `"completed"` or `"failed"`. There is no polling loop here; the
 * "Download PDF" button just stays disabled/labeled "Building…" for
 * whatever the real wall-clock time turns out to be.
 */
export function BuildPanel({
  profileId,
  ensureSaved,
}: {
  profileId: string;
  ensureSaved: () => Promise<void>;
}) {
  const { data: builds } = useBuilds();
  const createBuild = useCreateBuild();
  const deleteBuild = useDeleteBuild();
  const [lastBuild, setLastBuild] = useState<BuildResponse | null>(null);
  const [buildError, setBuildError] = useState<unknown>(null);

  const history = (builds ?? []).filter((b) => b.profile_id === profileId);

  async function handleBuild() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build</CardTitle>
        <CardDescription>Renders a real PDF via headless Chromium — takes a few seconds.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={handleBuild} disabled={createBuild.isPending} data-testid="build-pdf">
          <FileDown />
          {createBuild.isPending ? "Building…" : "Download PDF"}
        </Button>
        <ErrorMessage error={buildError} />
        {lastBuild?.status === "completed" && lastBuild.pdf_url && (
          <a
            href={lastBuild.pdf_url}
            target="_blank"
            rel="noreferrer"
            data-testid="latest-pdf-link"
            className="text-primary text-sm underline underline-offset-4"
          >
            Open latest PDF ({lastBuild.page_count} page{lastBuild.page_count === 1 ? "" : "s"},{" "}
            {Math.round((lastBuild.fill_pct ?? 0) * 100)}% fill)
          </a>
        )}

        {history.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-muted-foreground text-xs font-medium">Build history</p>
            <ul className="flex flex-col gap-1">
              {history.map((build) => (
                <li
                  key={build.id}
                  className="border-border flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs"
                >
                  <span>
                    {new Date(build.created_at).toLocaleString()} · {build.status}
                    {build.page_count != null ? ` · ${build.page_count}p` : ""}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete build"
                    onClick={() => deleteBuild.mutate(build.id)}
                  >
                    <Trash2 className="text-destructive size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
