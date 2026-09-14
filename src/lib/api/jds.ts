import { apiFetch, authFetch, throwIfNotOk } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the job-description CRUD surface
 * (`app/api/jds.py` in the backend). The backend's `POST /api/v1/jds/` is a
 * single multipart endpoint that supports three input modes — pasted text,
 * a pasted URL (the backend fetches and extracts it server-side via its
 * browser pool), or an uploaded file — rather than three separate
 * endpoints, so this file has one `createJd()` taking a discriminated
 * options object and building the right `FormData` for whichever mode was
 * used. Deliberately not routed through `apiFetch` (see content-upload.ts
 * for the same reasoning): multipart bodies aren't JSON.
 */
export type JDSummary = components["schemas"]["JDSummary"];
export type JDResponse = components["schemas"]["JDResponse"];

export type CreateJdInput =
  | { mode: "text"; text: string; title?: string; company?: string }
  | { mode: "url"; url: string; title?: string; company?: string }
  | { mode: "file"; file: File; title?: string; company?: string };

export async function listJds(): Promise<JDSummary[]> {
  const data = await apiFetch("/api/v1/jds/", { method: "get" });
  return data as unknown as JDSummary[];
}

export async function getJd(jdId: string): Promise<JDResponse> {
  const data = await apiFetch(`/api/v1/jds/${encodeURIComponent(jdId)}` as "/api/v1/jds/{jd_id}", {
    method: "get",
  });
  return data as unknown as JDResponse;
}

export async function createJd(input: CreateJdInput): Promise<JDResponse> {
  const form = new FormData();
  if (input.mode === "text") form.append("text", input.text);
  if (input.mode === "url") form.append("url", input.url);
  if (input.mode === "file") form.append("file", input.file);
  if (input.title) form.append("title", input.title);
  if (input.company) form.append("company", input.company);

  const response = await authFetch("/api/v1/jds/", { method: "POST", body: form });
  await throwIfNotOk(response);
  return (await response.json()) as JDResponse;
}

export async function deleteJd(jdId: string): Promise<void> {
  await apiFetch(`/api/v1/jds/${encodeURIComponent(jdId)}` as "/api/v1/jds/{jd_id}", {
    method: "delete",
  });
}
