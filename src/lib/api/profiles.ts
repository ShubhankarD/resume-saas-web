import { apiFetch, authFetch, throwIfNotOk } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the profile CRUD surface (app/api/profiles.py in the
 * backend). Mirrors content.ts's shape: GET/PUT/PATCH/DELETE on
 * `/{profile_id}` are typed `-> dict` on the backend, so we cast to
 * `ProfileWrite` (the round-trip contract `_profile_to_dict()` documents in
 * its own docstring) the same way content.ts casts to `ContentIn`.
 *
 * `ProfileWrite`'s field semantics (see app/services/resolve_service/
 * defaults.py's `selection_defaults()`, the single source of truth):
 *   - `experience: string[] | null` — role id order. `null` means "every
 *     role, content order". Every role must still appear when set
 *     explicitly (a role can't be dropped, only have its groups suppressed
 *     via `bullets[group_id] = []`).
 *   - `bullets: Record<group_id, bullet_id[]>` — selected bullet ids *and
 *     their order* for a group. A group id omitted from this map defaults to
 *     "every bullet in that group, content order".
 *   - `groups_order: string[]` — a flat, global group-id order used to sort
 *     each role's groups (index lookup); a group id omitted falls after
 *     every listed one.
 *   - `skills_order: string[]` — selected skill-group keys and their order
 *     (max 4 enforced server-side); omitted means "every skill group,
 *     content order".
 *   - `education: string[] | null` — selected education-entry ids and order;
 *     `null` means "every entry, content order".
 *   - `headings`/`bullet_overrides`/`skill_overrides` — per-id text
 *     overrides, keyed by group id / bullet id / skill key respectively.
 */
export type ProfileWrite = components["schemas"]["ProfileWrite"];
export type ProfilePatch = components["schemas"]["ProfilePatch"];
export type SkillOverrideIn = components["schemas"]["SkillOverrideIn"];

/** GET /api/v1/profiles/ returns a summary, not the full ProfileWrite shape
 * (see profile_service._profile_summary) — id/name/label/output/tagline/
 * density/max_pages only. */
export interface ProfileSummary {
  id: string;
  name: string;
  label: string;
  output: string | null;
  tagline: string;
  density: string;
  max_pages: number;
}

export async function listProfiles(): Promise<ProfileSummary[]> {
  const data = await apiFetch("/api/v1/profiles/", { method: "get" });
  return data as unknown as ProfileSummary[];
}

export async function createProfile(body: ProfileWrite): Promise<ProfileWrite & { id: string }> {
  const data = await apiFetch("/api/v1/profiles/", { method: "post", body });
  return data as unknown as ProfileWrite & { id: string };
}

export async function getProfile(profileId: string): Promise<ProfileWrite> {
  const data = await apiFetch(
    `/api/v1/profiles/${encodeURIComponent(profileId)}` as "/api/v1/profiles/{profile_id}",
    { method: "get" },
  );
  return data as unknown as ProfileWrite;
}

export async function updateProfile(profileId: string, body: ProfileWrite): Promise<ProfileWrite> {
  const data = await apiFetch(
    `/api/v1/profiles/${encodeURIComponent(profileId)}` as "/api/v1/profiles/{profile_id}",
    { method: "put", body },
  );
  return data as unknown as ProfileWrite;
}

export async function patchProfile(
  profileId: string,
  body: ProfilePatch,
): Promise<ProfileWrite> {
  const data = await apiFetch(
    `/api/v1/profiles/${encodeURIComponent(profileId)}` as "/api/v1/profiles/{profile_id}",
    { method: "patch", body },
  );
  return data as unknown as ProfileWrite;
}

export async function deleteProfile(profileId: string): Promise<void> {
  await apiFetch(
    `/api/v1/profiles/${encodeURIComponent(profileId)}` as "/api/v1/profiles/{profile_id}",
    { method: "delete" },
  );
}

/**
 * POST /api/v1/profiles/{id}/preview — deliberately not routed through
 * apiFetch: the backend returns a raw `text/html` body (FastAPI's generic
 * `Response`, not a JSON-typed schema — see app/api/profiles.py's
 * `preview_profile()` and openapi-typescript's generated operation, whose
 * response `content` comes back untyped/`never` for exactly that reason).
 * Uses `authFetch` the same way content.ts's import/export flows do for
 * non-JSON bodies, so auth-header injection and the one-shot 401-refresh
 * still apply.
 */
export async function previewProfile(profileId: string): Promise<string> {
  const response = await authFetch(`/api/v1/profiles/${encodeURIComponent(profileId)}/preview`, {
    method: "POST",
  });
  await throwIfNotOk(response);
  return response.text();
}
