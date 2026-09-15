"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download } from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { importContentYaml, downloadContentYaml } from "@/lib/api/content-upload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { ErrorMessage } from "@/components/content/error-message";

/**
 * YAML import/export UI (POST /api/v1/content/import, GET /api/v1/content/export).
 * Import fully replaces the existing content record (matching the
 * backend's replace-not-merge semantics — see
 * tests/test_content_import_export.py's test_put_replaces_existing_content),
 * so this page warns about that before letting the user pick a file.
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content library"
        title="Import & export"
        description="Move your content library in and out as a plain content.yaml file — useful for backups, or for editing offline."
        action={
          <Button
            variant="cta"
            onClick={handleDownload}
            disabled={downloading || !content}
            data-testid="export-yaml"
          >
            <Download aria-hidden="true" className="size-4" />
            {downloading ? "Downloading…" : "Download content.yaml"}
          </Button>
        }
      />

      {(!content || Boolean(downloadError)) && (
        <div className="space-y-3">
          {!content && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You don&apos;t have any content yet, so there&apos;s nothing to export.
            </p>
          )}
          <ErrorMessage error={downloadError} />
        </div>
      )}

      <Card className="space-y-6 p-6 sm:p-8">
        <SectionHeader
          title="Import from YAML"
          description="Uploading a file replaces your entire content record — every existing role, group, bullet, tagline, skill, and education entry is discarded and replaced by what's in the file."
        />

        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
          <p className="mb-4 text-sm font-medium text-amber-900 dark:text-amber-200">
            This replaces everything. Export a copy first if you want a backup.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml,application/x-yaml,text/yaml"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importMutation.mutate(file);
            }}
            disabled={importMutation.isPending}
            aria-label="Choose a content.yaml file to import"
            data-testid="import-yaml-input"
            className="focus-visible:ring-ring/50 block w-full cursor-pointer text-sm text-slate-600 outline-none file:mr-4 file:h-10 file:cursor-pointer file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:file:bg-slate-50 dark:file:text-slate-900 dark:hover:file:bg-slate-200"
          />
        </div>

        {importMutation.isPending && (
          <p className="text-sm text-slate-600 dark:text-slate-400">Importing…</p>
        )}
        {importMutation.isSuccess && (
          <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Imported &quot;{importMutation.data.name}&quot; successfully.
          </p>
        )}
        <ErrorMessage error={importMutation.error} />
      </Card>
    </div>
  );
}
