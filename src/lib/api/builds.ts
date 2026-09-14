import { apiFetch } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the build CRUD surface (app/api/builds.py in the
 * backend). `POST /api/v1/builds/` is fully synchronous on the backend side
 * (app/services/build_service.py's create_build awaits the entire
 * resolve -> measure_fill (two real headless-Chromium passes) -> PDF
 * compile -> upload pipeline inside the request handler itself) — by the
 * time this call resolves, `status` is already a terminal value
 * ("completed" or "failed"), never "pending". There is no separate
 * job-status endpoint to poll for a build; the request itself just takes
 * real wall-clock time (Playwright launches, renders, and converts to PDF).
 */
export type BuildCreate = components["schemas"]["BuildCreate"];
export type BuildResponse = components["schemas"]["BuildResponse"];
export type BuildSummary = components["schemas"]["BuildSummary"];

export async function listBuilds(): Promise<BuildSummary[]> {
  const data = await apiFetch("/api/v1/builds/", { method: "get" });
  return data as unknown as BuildSummary[];
}

export async function createBuild(body: BuildCreate): Promise<BuildResponse> {
  const data = await apiFetch("/api/v1/builds/", { method: "post", body });
  return data as unknown as BuildResponse;
}

export async function getBuild(buildId: string): Promise<BuildResponse> {
  const data = await apiFetch(
    `/api/v1/builds/${encodeURIComponent(buildId)}` as "/api/v1/builds/{build_id}",
    { method: "get" },
  );
  return data as unknown as BuildResponse;
}

export async function deleteBuild(buildId: string): Promise<void> {
  await apiFetch(`/api/v1/builds/${encodeURIComponent(buildId)}` as "/api/v1/builds/{build_id}", {
    method: "delete",
  });
}
