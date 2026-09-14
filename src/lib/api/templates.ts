import { apiFetch } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrapper around GET /api/v1/templates/ (app/api/templates.py in the
 * backend) — static, unauthenticated template metadata for the template
 * gallery. No tenant scoping needed: this endpoint has no CurrentUser
 * dependency at all (see the backend's own docstring).
 */
export type TemplateInfo = components["schemas"]["TemplateInfo"];

export async function listTemplates(): Promise<TemplateInfo[]> {
  const data = await apiFetch("/api/v1/templates/", { method: "get" });
  return data as unknown as TemplateInfo[];
}
