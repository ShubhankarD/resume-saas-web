import { apiFetch } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/**
 * Typed wrappers around the content CRUD surface (app/api/content.py in the
 * backend). The granular roles/groups/bullets/taglines/skills/education
 * endpoints are used for every create/edit/delete in the UI — never a full
 * `PUT /content/` per keystroke (see plans/phase-F3-content-editor.md) — a
 * whole-record PUT is reserved for import/intake-save/start-from-scratch.
 *
 * GET/PUT `/content/` are typed `-> dict` on the backend (see
 * app/api/content.py), so openapi-typescript can't give us a precise
 * response shape for them; we cast to `ContentIn` (the same schema used as
 * the PUT request body) since get_content_as_dict()'s output is documented
 * as round-tripping through that exact shape.
 */

export type ContentIn = components["schemas"]["ContentIn"];
export type IntakeResponse = components["schemas"]["IntakeResponse"];
export type RoleIn = components["schemas"]["RoleIn"];
export type GroupIn = components["schemas"]["GroupIn"];
export type BulletIn = components["schemas"]["BulletIn"];
export type ContactEntryIn = components["schemas"]["ContactEntryIn"];
export type SkillGroupIn = components["schemas"]["SkillGroupIn"];
export type EducationEntryIn = components["schemas"]["EducationEntryIn"];

export type RoleCreate = components["schemas"]["RoleCreate"];
export type RoleUpdate = components["schemas"]["RoleUpdate"];
export type GroupCreate = components["schemas"]["GroupCreate"];
export type GroupUpdate = components["schemas"]["GroupUpdate"];
export type BulletCreate = components["schemas"]["BulletCreate"];
export type BulletUpdate = components["schemas"]["BulletUpdate"];
export type TaglineUpdate = components["schemas"]["TaglineUpdate"];
export type SkillGroupUpdate = components["schemas"]["SkillGroupUpdate"];
export type EducationEntryUpdate = components["schemas"]["EducationEntryUpdate"];

/** 404 on GET /content/ means "no content record yet" — the empty state,
 * not a hard error. Callers should catch ApiError with status 404 and treat
 * it as `null`; this helper does that for the common case (useQuery). */
export async function getContent(): Promise<ContentIn> {
  const data = await apiFetch("/api/v1/content/", { method: "get" });
  return data as unknown as ContentIn;
}

export async function putContent(body: ContentIn): Promise<ContentIn> {
  const data = await apiFetch("/api/v1/content/", { method: "put", body });
  return data as unknown as ContentIn;
}

// --- Roles ---

export async function createRole(body: RoleCreate) {
  const data = await apiFetch("/api/v1/content/roles", { method: "post", body });
  return data as unknown as RoleIn;
}

export async function updateRole(roleId: string, body: RoleUpdate) {
  const data = await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}` as "/api/v1/content/roles/{role_id}",
    {
      method: "put",
      body,
    },
  );
  return data as unknown as RoleIn;
}

export async function deleteRole(roleId: string) {
  await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}` as "/api/v1/content/roles/{role_id}",
    {
      method: "delete",
    },
  );
}

// --- Groups ---

export async function createGroup(roleId: string, body: GroupCreate) {
  const data = await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}/groups` as "/api/v1/content/roles/{role_id}/groups",
    { method: "post", body },
  );
  return data as unknown as GroupIn;
}

export async function updateGroup(roleId: string, groupId: string, body: GroupUpdate) {
  const data = await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}/groups/${encodeURIComponent(groupId)}` as "/api/v1/content/roles/{role_id}/groups/{group_id}",
    { method: "put", body },
  );
  return data as unknown as GroupIn;
}

export async function deleteGroup(roleId: string, groupId: string) {
  await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}/groups/${encodeURIComponent(groupId)}` as "/api/v1/content/roles/{role_id}/groups/{group_id}",
    { method: "delete" },
  );
}

// --- Bullets ---

export async function createBullet(roleId: string, groupId: string, body: BulletCreate) {
  const data = await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}/groups/${encodeURIComponent(groupId)}/bullets` as "/api/v1/content/roles/{role_id}/groups/{group_id}/bullets",
    { method: "post", body },
  );
  return data as unknown as BulletIn;
}

export async function updateBullet(
  roleId: string,
  groupId: string,
  bulletId: string,
  body: BulletUpdate,
) {
  const data = await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}/groups/${encodeURIComponent(groupId)}/bullets/${encodeURIComponent(bulletId)}` as "/api/v1/content/roles/{role_id}/groups/{group_id}/bullets/{bullet_id}",
    { method: "put", body },
  );
  return data as unknown as BulletIn;
}

export async function deleteBullet(roleId: string, groupId: string, bulletId: string) {
  await apiFetch(
    `/api/v1/content/roles/${encodeURIComponent(roleId)}/groups/${encodeURIComponent(groupId)}/bullets/${encodeURIComponent(bulletId)}` as "/api/v1/content/roles/{role_id}/groups/{group_id}/bullets/{bullet_id}",
    { method: "delete" },
  );
}

// --- Taglines ---

export async function listTaglines() {
  const data = await apiFetch("/api/v1/content/taglines", { method: "get" });
  return data as Record<string, string>;
}

export async function upsertTagline(key: string, body: TaglineUpdate) {
  const data = await apiFetch(
    `/api/v1/content/taglines/${encodeURIComponent(key)}` as "/api/v1/content/taglines/{key}",
    { method: "put", body },
  );
  return data as unknown as { key: string; text: string };
}

export async function deleteTagline(key: string) {
  await apiFetch(
    `/api/v1/content/taglines/${encodeURIComponent(key)}` as "/api/v1/content/taglines/{key}",
    {
      method: "delete",
    },
  );
}

// --- Skills ---

export async function listSkills() {
  const data = await apiFetch("/api/v1/content/skills", { method: "get" });
  return data as unknown as Record<string, SkillGroupIn>;
}

export async function upsertSkill(key: string, body: SkillGroupUpdate) {
  const data = await apiFetch(
    `/api/v1/content/skills/${encodeURIComponent(key)}` as "/api/v1/content/skills/{key}",
    { method: "put", body },
  );
  return data as unknown as SkillGroupIn & { key: string };
}

export async function deleteSkill(key: string) {
  await apiFetch(
    `/api/v1/content/skills/${encodeURIComponent(key)}` as "/api/v1/content/skills/{key}",
    {
      method: "delete",
    },
  );
}

// --- Education ---

export async function listEducation() {
  const data = await apiFetch("/api/v1/content/education", { method: "get" });
  return data as unknown as EducationEntryIn[];
}

export async function upsertEducation(entryId: string, body: EducationEntryUpdate) {
  const data = await apiFetch(
    `/api/v1/content/education/${encodeURIComponent(entryId)}` as "/api/v1/content/education/{entry_id}",
    { method: "put", body },
  );
  return data as unknown as EducationEntryIn;
}

export async function deleteEducation(entryId: string) {
  await apiFetch(
    `/api/v1/content/education/${encodeURIComponent(entryId)}` as "/api/v1/content/education/{entry_id}",
    { method: "delete" },
  );
}
