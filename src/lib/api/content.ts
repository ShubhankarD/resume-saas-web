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
 * not a hard error. See useContent(), which maps that 404 to `null`. */
export async function getContent(): Promise<ContentIn> {
  return (await apiFetch("/api/v1/content/", { method: "get" })) as ContentIn;
}

export async function putContent(body: ContentIn): Promise<ContentIn> {
  return (await apiFetch("/api/v1/content/", { method: "put", body })) as ContentIn;
}

// --- Roles ---

export async function createRole(body: RoleCreate) {
  return (await apiFetch("/api/v1/content/roles", { method: "post", body })) as RoleIn;
}

export async function updateRole(roleId: string, body: RoleUpdate) {
  return (await apiFetch("/api/v1/content/roles/{role_id}", {
    method: "put",
    params: { role_id: roleId },
    body,
  })) as RoleIn;
}

export async function deleteRole(roleId: string) {
  await apiFetch("/api/v1/content/roles/{role_id}", {
    method: "delete",
    params: { role_id: roleId },
  });
}

// --- Groups ---

export async function createGroup(roleId: string, body: GroupCreate) {
  return (await apiFetch("/api/v1/content/roles/{role_id}/groups", {
    method: "post",
    params: { role_id: roleId },
    body,
  })) as GroupIn;
}

export async function updateGroup(roleId: string, groupId: string, body: GroupUpdate) {
  return (await apiFetch("/api/v1/content/roles/{role_id}/groups/{group_id}", {
    method: "put",
    params: { role_id: roleId, group_id: groupId },
    body,
  })) as GroupIn;
}

export async function deleteGroup(roleId: string, groupId: string) {
  await apiFetch("/api/v1/content/roles/{role_id}/groups/{group_id}", {
    method: "delete",
    params: { role_id: roleId, group_id: groupId },
  });
}

// --- Bullets ---

export async function createBullet(roleId: string, groupId: string, body: BulletCreate) {
  return (await apiFetch("/api/v1/content/roles/{role_id}/groups/{group_id}/bullets", {
    method: "post",
    params: { role_id: roleId, group_id: groupId },
    body,
  })) as BulletIn;
}

export async function updateBullet(
  roleId: string,
  groupId: string,
  bulletId: string,
  body: BulletUpdate,
) {
  return (await apiFetch("/api/v1/content/roles/{role_id}/groups/{group_id}/bullets/{bullet_id}", {
    method: "put",
    params: { role_id: roleId, group_id: groupId, bullet_id: bulletId },
    body,
  })) as BulletIn;
}

export async function deleteBullet(roleId: string, groupId: string, bulletId: string) {
  await apiFetch("/api/v1/content/roles/{role_id}/groups/{group_id}/bullets/{bullet_id}", {
    method: "delete",
    params: { role_id: roleId, group_id: groupId, bullet_id: bulletId },
  });
}

// --- Taglines ---

export async function listTaglines() {
  return (await apiFetch("/api/v1/content/taglines", { method: "get" })) as Record<string, string>;
}

export async function upsertTagline(key: string, body: TaglineUpdate) {
  return (await apiFetch("/api/v1/content/taglines/{key}", {
    method: "put",
    params: { key },
    body,
  })) as { key: string; text: string };
}

export async function deleteTagline(key: string) {
  await apiFetch("/api/v1/content/taglines/{key}", { method: "delete", params: { key } });
}

// --- Skills ---

export async function listSkills() {
  return (await apiFetch("/api/v1/content/skills", { method: "get" })) as Record<
    string,
    SkillGroupIn
  >;
}

export async function upsertSkill(key: string, body: SkillGroupUpdate) {
  return (await apiFetch("/api/v1/content/skills/{key}", {
    method: "put",
    params: { key },
    body,
  })) as SkillGroupIn & { key: string };
}

export async function deleteSkill(key: string) {
  await apiFetch("/api/v1/content/skills/{key}", { method: "delete", params: { key } });
}

// --- Education ---

export async function listEducation() {
  return (await apiFetch("/api/v1/content/education", {
    method: "get",
  })) as EducationEntryIn[];
}

export async function upsertEducation(entryId: string, body: EducationEntryUpdate) {
  return (await apiFetch("/api/v1/content/education/{entry_id}", {
    method: "put",
    params: { entry_id: entryId },
    body,
  })) as EducationEntryIn;
}

export async function deleteEducation(entryId: string) {
  await apiFetch("/api/v1/content/education/{entry_id}", {
    method: "delete",
    params: { entry_id: entryId },
  });
}
