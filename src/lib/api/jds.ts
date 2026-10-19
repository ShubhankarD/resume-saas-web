import { apiFetch, apiUpload } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the job-description CRUD surface
 * (`app/api/jds.py` in the backend). The backend's `POST /api/v1/jds/` is a
 * single multipart endpoint that supports three input modes — pasted text,
 * a pasted URL (the backend fetches and extracts it server-side via its
 * browser pool), or an uploaded file — rather than three separate
 * endpoints, so this file has one `createJd()` taking a discriminated
 * options object and sending whichever mode's field through `apiUpload`
 * (the multipart counterpart of `apiFetch`).
 */
export type JDSummary = components["schemas"]["JDSummary"];
export type JDResponse = components["schemas"]["JDResponse"];

export type CreateJdInput =
  | { mode: "text"; text: string; title?: string; company?: string }
  | { mode: "url"; url: string; title?: string; company?: string }
  | { mode: "file"; file: File; title?: string; company?: string };

export async function listJds(): Promise<JDSummary[]> {
  return apiFetch("/api/v1/jds/", { method: "get" });
}

export async function getJd(jdId: string): Promise<JDResponse> {
  return apiFetch("/api/v1/jds/{jd_id}", { params: { jd_id: jdId }, method: "get" });
}

export async function createJd(input: CreateJdInput): Promise<JDResponse> {
  return apiUpload("/api/v1/jds/", {
    text: input.mode === "text" ? input.text : undefined,
    url: input.mode === "url" ? input.url : undefined,
    file: input.mode === "file" ? input.file : undefined,
    title: input.title || undefined,
    company: input.company || undefined,
  });
}

export async function deleteJd(jdId: string): Promise<void> {
  await apiFetch("/api/v1/jds/{jd_id}", { params: { jd_id: jdId }, method: "delete" });
}
