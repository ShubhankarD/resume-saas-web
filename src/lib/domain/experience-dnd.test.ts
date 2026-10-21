import { describe, expect, it } from "vitest";
import type { ProfileWrite } from "@/lib/api/profiles";
import { ProfileSelection } from "@/lib/profile-draft";
import { contentFixture, draftFixture, roleFixture } from "@/lib/test-support/content-fixtures";
import { bulletSortableId, groupSortableId, reorderPatch, roleSortableId } from "./experience-dnd";

const content = contentFixture({
  experience: [
    roleFixture("r1", { g1: ["b1", "b2", "b3"], g2: [] }),
    roleFixture("r2", { g3: [] }),
  ],
});

const selection = (patch: Partial<ProfileWrite> = {}) =>
  new ProfileSelection(draftFixture(patch), content);

describe("reorderPatch", () => {
  it("reorders roles", () => {
    expect(reorderPatch(selection(), roleSortableId("r1"), roleSortableId("r2"))).toEqual({
      experience: ["r2", "r1"],
    });
  });

  it("reorders groups within a role into the global groups_order", () => {
    expect(
      reorderPatch(selection(), groupSortableId("r1", "g1"), groupSortableId("r1", "g2")),
    ).toEqual({ groups_order: ["g2", "g1", "g3"] });
  });

  it("refuses to move a group across roles", () => {
    expect(
      reorderPatch(selection(), groupSortableId("r1", "g1"), groupSortableId("r2", "g3")),
    ).toBeNull();
  });

  it("reorders bullets within a group, keeping other groups' selections", () => {
    const patch = reorderPatch(
      selection({ bullets: { g2: ["x"] } }),
      bulletSortableId("r1", "g1", "b1"),
      bulletSortableId("r1", "g1", "b3"),
    );
    expect(patch).toEqual({ bullets: { g2: ["x"], g1: ["b2", "b3", "b1"] } });
  });

  it("refuses to move a bullet to another group", () => {
    expect(
      reorderPatch(
        selection(),
        bulletSortableId("r1", "g1", "b1"),
        bulletSortableId("r1", "g2", "b9"),
      ),
    ).toBeNull();
  });

  it("ignores unknown kinds and stale ids", () => {
    expect(reorderPatch(selection(), "nope:x", "nope:y")).toBeNull();
    expect(reorderPatch(selection(), roleSortableId("r1"), roleSortableId("gone"))).toBeNull();
  });
});
