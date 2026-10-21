import type { ContentIn, RoleIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { emptyContent } from "@/lib/domain/content-overview";
import { newProfileDraft } from "@/lib/domain/profile-defaults";

/**
 * Typed builders for unit tests: full, schema-valid records with only the
 * fields a test cares about overridden, so a schema change breaks the
 * fixture at compile time instead of hiding behind a cast.
 */

/** A role whose groups are given as `{ groupId: [bulletId, …] }`. */
export function roleFixture(
  id: string,
  groups: Record<string, string[]> = {},
  overrides: Partial<Omit<RoleIn, "id" | "groups">> = {},
): RoleIn {
  return {
    id,
    title: "Engineer",
    org: "Acme",
    dates: "2020",
    ...overrides,
    groups: Object.entries(groups).map(([groupId, bulletIds]) => ({
      id: groupId,
      bullets: bulletIds.map((bulletId) => ({ id: bulletId, text: bulletId, tags: [] })),
    })),
  };
}

export function contentFixture(parts: Partial<Omit<ContentIn, "name">> = {}): ContentIn {
  return { ...emptyContent("Test"), ...parts };
}

export function draftFixture(patch: Partial<ProfileWrite> = {}): ProfileWrite {
  return { ...newProfileDraft({ name: "test", label: "Test" }), ...patch };
}
