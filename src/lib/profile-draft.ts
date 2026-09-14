import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";

/**
 * Pure helpers deriving editor display state from a `ProfileWrite` draft +
 * the full `ContentIn` it's built from. Mirrors the backend's own
 * omission-defaulting rules in app/services/resolve_service/defaults.py's
 * `selection_defaults()` — the single source of truth this file is a
 * client-side read of, not a reimplementation with independent rules (a
 * profile with `experience: null` must display exactly the roles resolve()
 * would use, in the same order).
 */

export function effectiveRoleOrder(draft: ProfileWrite, content: ContentIn): string[] {
  // Matches selection_defaults(): only an explicit `null` defaults to "every
  // role, content order" — an explicit (non-null) list is used as-is, even
  // though the UI itself never constructs an explicit list missing a role
  // (the backend rejects that with ProfileValidationError).
  if (draft.experience != null) return draft.experience;
  return content.experience.map((r) => r.id);
}

function groupIdsForRole(content: ContentIn, roleId: string): string[] {
  const role = content.experience.find((r) => r.id === roleId);
  return (role?.groups ?? []).map((g) => g.id);
}

/** This role's group ids, ordered per `draft.groups_order` where known,
 * with any group missing from that (global) order appended in content
 * order — same fallback `resolve()` applies via its `group_order.index(...)
 * if ... else len(group_order)` sort key. */
export function groupOrderForRole(draft: ProfileWrite, content: ContentIn, roleId: string): string[] {
  const allIds = groupIdsForRole(content, roleId);
  const globalOrder = draft.groups_order ?? [];
  const known = globalOrder.filter((id) => allIds.includes(id));
  const missing = allIds.filter((id) => !known.includes(id));
  return [...known, ...missing];
}

/** Rebuilds the flat, global `groups_order` after a drag-reorder within one
 * role's group list — replaces that role's slice with `newRoleOrder` while
 * preserving every other role's own (already-effective) order, concatenated
 * in role-display order. Safe because `resolve()` only ever compares a
 * group id's position against other ids in this same flat list when
 * sorting *that* group's own role — cross-role relative order is never
 * observed. */
export function rebuildGroupsOrder(
  draft: ProfileWrite,
  content: ContentIn,
  changedRoleId: string,
  newRoleOrder: string[],
): string[] {
  const roleOrder = effectiveRoleOrder(draft, content);
  const result: string[] = [];
  for (const roleId of roleOrder) {
    if (roleId === changedRoleId) {
      result.push(...newRoleOrder);
    } else {
      result.push(...groupOrderForRole(draft, content, roleId));
    }
  }
  return result;
}

/** Selected bullet ids (and their order) for one group — the group's
 * explicit `bullets[group_id]` entry when present (even if `[]`, meaning
 * "suppressed"), else every bullet in that group, content order. */
export function selectedBulletIds(draft: ProfileWrite, content: ContentIn, groupId: string): string[] {
  const bullets = draft.bullets ?? {};
  if (groupId in bullets) return bullets[groupId];
  for (const role of content.experience) {
    const group = (role.groups ?? []).find((g) => g.id === groupId);
    if (group) return (group.bullets ?? []).map((b) => b.id);
  }
  return [];
}

export function effectiveSkillsOrder(draft: ProfileWrite, content: ContentIn): string[] {
  if (draft.skills_order && draft.skills_order.length > 0) return draft.skills_order;
  return Object.keys(content.skills);
}

export function effectiveEducationOrder(draft: ProfileWrite, content: ContentIn): string[] {
  // Matches selection_defaults(): a `null` `education` defaults to "every
  // entry, content order"; an explicit `[]` is respected as "none selected"
  // (unlike `skills_order`/`bullets`, which use Python's `or`-style
  // falsy-default and so treat `[]` the same as omitted).
  if (draft.education != null) return draft.education;
  return content.education.map((e) => e.id);
}

export const MAX_SKILLS_GROUPS = 4;
