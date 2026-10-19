import { apiUpload, authFetch, throwIfNotOk } from "@/lib/api/client";
import type { ContentIn, IntakeResponse } from "@/lib/api/content";

/**
 * Multipart upload + YAML-download helpers for content import/export/intake
 * (app/api/content.py's POST /import, POST /intake, GET /export). Import and
 * intake are multipart and go through `apiUpload`; the YAML download isn't
 * JSON, so it uses `authFetch` (see src/lib/api/client.ts).
 */

export async function importContentYaml(file: File): Promise<ContentIn> {
  // The backend documents this response as a free-form object, so the schema
  // cannot type it; the endpoint returns the imported `ContentIn`.
  return (await apiUpload("/api/v1/content/import", { file })) as ContentIn;
}

export async function intakeResume(file: File): Promise<IntakeResponse> {
  return apiUpload("/api/v1/content/intake", { file });
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
