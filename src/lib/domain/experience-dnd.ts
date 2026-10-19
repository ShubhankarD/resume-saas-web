import type { ProfileWrite } from "@/lib/api/profiles";
import type { ProfileSelection } from "@/lib/profile-draft";
import { moveItem } from "@/lib/domain/reorder";

/**
 * Roles, groups and bullets are three independent reorderable lists nested in
 * one DOM tree under a single `DndContext`, so their sortable ids carry a
 * kind prefix and their parents: `role:<r>`, `group:<r>:<g>`,
 * `bullet:<r>:<g>:<b>`. This module owns that scheme and turns a drag-end
 * into the draft patch it implies.
 */

export const roleSortableId = (roleId: string) => `role:${roleId}`;
export const groupSortableId = (roleId: string, groupId: string) => `group:${roleId}:${groupId}`;
export const bulletSortableId = (roleId: string, groupId: string, bulletId: string) =>
  `bullet:${roleId}:${groupId}:${bulletId}`;

/** The draft change for dragging `activeId` over `overId`, or `null` when the
 * move is not allowed (different parent) or refers to something unknown. */
export function reorderPatch(
  selection: ProfileSelection,
  activeId: string,
  overId: string,
): Partial<ProfileWrite> | null {
  const [kind, ...active] = activeId.split(":");
  const [, ...over] = overId.split(":");

  if (kind === "role") {
    const order = moveItem(selection.roleOrder(), active[0], over[0]);
    return order && { experience: order };
  }

  if (kind === "group") {
    const [roleId, groupId] = active;
    const [overRoleId, overGroupId] = over;
    if (roleId !== overRoleId) return null; // groups only reorder within their own role
    const order = moveItem(selection.groupOrder(roleId), groupId, overGroupId);
    return order && { groups_order: selection.groupsOrderWith(roleId, order) };
  }

  if (kind === "bullet") {
    const [roleId, groupId, bulletId] = active;
    const [overRoleId, overGroupId, overBulletId] = over;
    if (roleId !== overRoleId || groupId !== overGroupId) return null;
    const order = moveItem(selection.bulletIds(groupId), bulletId, overBulletId);
    return order && { bullets: { ...(selection.draft.bullets ?? {}), [groupId]: order } };
  }

  return null;
}
