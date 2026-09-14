"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { importContentYaml, downloadContentYaml } from "@/lib/api/content-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Export as YAML</CardTitle>
          <CardDescription>
            Downloads your current content as a <code>content.yaml</code> file.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            onClick={handleDownload}
            disabled={downloading || !content}
            className="self-start"
            data-testid="export-yaml"
          >
            {downloading ? "Downloading…" : "Download content.yaml"}
          </Button>
          {!content && (
            <p className="text-muted-foreground text-xs">
              You don&apos;t have any content yet, so there&apos;s nothing to export.
            </p>
          )}
          <ErrorMessage error={downloadError} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import from YAML</CardTitle>
          <CardDescription>
            Uploading a file <strong>replaces</strong> your entire content record — every existing
            role, group, bullet, tagline, skill, and education entry is discarded and replaced by
            what&apos;s in the file.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml,application/x-yaml,text/yaml"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importMutation.mutate(file);
            }}
            data-testid="import-yaml-input"
            className="text-sm"
          />
          {importMutation.isPending && <p className="text-muted-foreground text-sm">Importing…</p>}
          {importMutation.isSuccess && (
            <p className="text-sm text-green-600 dark:text-green-500">
              Imported &quot;{importMutation.data.name}&quot; successfully.
            </p>
          )}
          <ErrorMessage error={importMutation.error} />
        </CardContent>
      </Card>
    </div>
  );
}
