import { authFetch, throwIfNotOk } from "@/lib/api/client";
import type { ContentIn, IntakeResponse } from "@/lib/api/content";

/**
 * Multipart upload + YAML-download helpers for content import/export/intake
 * (app/api/content.py's POST /import, POST /intake, GET /export). These
 * three don't fit apiFetch's JSON-only request/response shape, so they go
 * through authFetch directly (see src/lib/api/client.ts).
 */

export async function importContentYaml(file: File): Promise<ContentIn> {
  const form = new FormData();
  form.append("file", file);
  const response = await authFetch("/api/v1/content/import", {
    method: "POST",
    body: form,
  });
  await throwIfNotOk(response);
  return (await response.json()) as ContentIn;
}

export async function intakeResume(file: File): Promise<IntakeResponse> {
  const form = new FormData();
  form.append("file", file);
  const response = await authFetch("/api/v1/content/intake", {
    method: "POST",
    body: form,
  });
  await throwIfNotOk(response);
  return (await response.json()) as IntakeResponse;
}

/**
 * Downloads GET /api/v1/content/export and triggers a real browser save,
 * using the filename from the response's Content-Disposition header (the
 * backend sends `attachment; filename=content.yaml` — see
 * app/core/yaml_io.py's yaml_attachment()) rather than a hardcoded name.
 */
export async function downloadContentYaml(): Promise<void> {
  const response = await authFetch("/api/v1/content/export", { method: "GET" });
  await throwIfNotOk(response);

  const disposition = response.headers.get("content-disposition") ?? "";
  const match = /filename="?([^";]+)"?/.exec(disposition);
  const filename = match?.[1] ?? "content.yaml";

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
