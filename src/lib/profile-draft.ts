import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";

export const MAX_SKILLS_GROUPS = 4;

/**
 * Read-model over a `ProfileWrite` draft + the full `ContentIn` it's built
 * from: answers "what does this resume actually show, in what order?" by
 * applying the backend's own omission-defaulting rules in
 * app/services/resolve_service/defaults.py's `selection_defaults()` — the
 * single source of truth this class is a client-side read of, not a
 * reimplementation with independent rules (a profile with
 * `experience: null` must display exactly the roles resolve() would use,
 * in the same order).
 *
 * Immutable and cheap to construct: build one per render from the current
 * draft (`new ProfileSelection(draft, content)`); methods that compute a
 * changed field return the new value for the caller to patch into the
 * draft rather than mutating anything.
 */
export class ProfileSelection {
  constructor(
    readonly draft: ProfileWrite,
    readonly content: ContentIn,
  ) {}

  roleOrder(): string[] {
    // Matches selection_defaults(): only an explicit `null` defaults to "every
    // role, content order" — an explicit (non-null) list is used as-is, even
    // though the UI itself never constructs an explicit list missing a role
    // (the backend rejects that with ProfileValidationError).
    if (this.draft.experience != null) return this.draft.experience;
    return this.content.experience.map((r) => r.id);
  }

  /** This role's group ids, ordered per `draft.groups_order` where known,
   * with any group missing from that (global) order appended in content
   * order — same fallback `resolve()` applies via its `group_order.index(...)
   * if ... else len(group_order)` sort key. */
  groupOrder(roleId: string): string[] {
    const role = this.content.experience.find((r) => r.id === roleId);
    const allIds = (role?.groups ?? []).map((g) => g.id);
    const globalOrder = this.draft.groups_order ?? [];
    const known = globalOrder.filter((id) => allIds.includes(id));
    const missing = allIds.filter((id) => !known.includes(id));
    return [...known, ...missing];
  }

  /** The flat, global `groups_order` after a drag-reorder within one role's
   * group list — replaces that role's slice with `newRoleOrder` while
   * preserving every other role's own (already-effective) order,
   * concatenated in role-display order. Safe because `resolve()` only ever
   * compares a group id's position against other ids in this same flat list
   * when sorting *that* group's own role — cross-role relative order is
   * never observed. */
  groupsOrderWith(changedRoleId: string, newRoleOrder: string[]): string[] {
    return this.roleOrder().flatMap((roleId) =>
      roleId === changedRoleId ? newRoleOrder : this.groupOrder(roleId),
    );
  }

  /** Selected bullet ids (and their order) for one group — the group's
   * explicit `bullets[group_id]` entry when present (even if `[]`, meaning
   * "suppressed"), else every bullet in that group, content order. */
  bulletIds(groupId: string): string[] {
    const bullets = this.draft.bullets ?? {};
    if (groupId in bullets) return bullets[groupId];
    for (const role of this.content.experience) {
      const group = (role.groups ?? []).find((g) => g.id === groupId);
      if (group) return (group.bullets ?? []).map((b) => b.id);
    }
    return [];
  }

  skillsOrder(): string[] {
    if (this.draft.skills_order && this.draft.skills_order.length > 0) {
      return this.draft.skills_order;
    }
    return Object.keys(this.content.skills);
  }

  educationOrder(): string[] {
    // Matches selection_defaults(): a `null` `education` defaults to "every
    // entry, content order"; an explicit `[]` is respected as "none selected"
    // (unlike `skills_order`/`bullets`, which use Python's `or`-style
    // falsy-default and so treat `[]` the same as omitted).
    if (this.draft.education != null) return this.draft.education;
    return this.content.education.map((e) => e.id);
  }
}
