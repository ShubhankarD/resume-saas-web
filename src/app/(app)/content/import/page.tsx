"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Download, Upload } from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { importContentYaml, downloadContentYaml } from "@/lib/api/content-upload";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";

/**
 * YAML import/export UI (POST /api/v1/content/import, GET /api/v1/content/export).
 * Import fully replaces the existing content record (matching the
 * backend's replace-not-merge semantics — see
 * tests/test_content_import_export.py's test_put_replaces_existing_content),
 * so this page warns about that before letting the user pick a file.
 *
 * Presented as utility rows — label, one-line description, right-aligned
 * action — rather than feature cards: this is a maintenance screen.
 */
export default function ImportExportPage() {
  const { data: content } = useContent();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadError, setDownloadError] = useState<unknown>(null);
  const [downloading, setDownloading] = useState(false);

  const importMutation = useMutation({
    mutationFn: (file: File) => importContentYaml(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  async function handleDownload() {
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadContentYaml();
    } catch (err) {
      setDownloadError(err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content library"
        title="Import & export"
        description="Move content into or out of your library as a plain content.yaml file."
      />

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Import
        </h2>

        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <label
                htmlFor="import-yaml-file"
                className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                <Upload aria-hidden="true" className="size-4 text-slate-400" />
                Import content.yaml
              </label>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Restore or migrate a structured content library.
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="import-yaml-file"
              type="file"
              accept=".yaml,.yml,application/x-yaml,text/yaml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importMutation.mutate(file);
              }}
              disabled={importMutation.isPending}
              data-testid="import-yaml-input"
              className="focus-visible:ring-ring/50 block w-full shrink-0 cursor-pointer rounded-md text-xs text-slate-600 outline-none file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-4 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-50 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:text-slate-400 dark:file:border-slate-800 dark:file:bg-slate-900 dark:file:text-slate-100 dark:hover:file:bg-slate-800"
            />
          </div>

          {importMutation.isPending && (
            <p aria-live="polite" className="text-xs text-slate-500 dark:text-slate-400">
              Importing…
            </p>
          )}

          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Importing replaces your entire record — every role, group, bullet, tagline, skill, and
              education entry. Export a copy first if you want a backup.
            </span>
          </p>

          {importMutation.isSuccess && (
            <p
              aria-live="polite"
              className="flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-400"
            >
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Imported &quot;{importMutation.data.name}&quot; successfully.
            </p>
          )}
          <ErrorMessage error={importMutation.error} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Export
        </h2>

        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Export content.yaml
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {content
                  ? "Download your structured content library."
                  : "Nothing to export yet — create your content library first."}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading || !content}
              data-testid="export-yaml"
              className="shrink-0"
            >
              <Download aria-hidden="true" className="size-4" />
              {downloading ? "Downloading…" : "Download"}
            </Button>
          </div>

          <ErrorMessage error={downloadError} />
        </div>
      </section>
    </div>
  );
}
