import { describe, expect, it } from "vitest";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { ProfileSelection } from "@/lib/profile-draft";
import { bulletSortableId, groupSortableId, reorderPatch, roleSortableId } from "./experience-dnd";

// Only the id structure matters here; the cast stays inside this fixture
// (ContentIn has many required fields these rules never read).
const content = {
  experience: [
    {
      id: "r1",
      groups: [
        { id: "g1", bullets: [{ id: "b1" }, { id: "b2" }, { id: "b3" }] },
        { id: "g2", bullets: [] },
      ],
    },
    { id: "r2", groups: [{ id: "g3", bullets: [] }] },
  ],
  skills: {},
  education: [],
} as unknown as ContentIn;

const selection = (patch: Partial<ProfileWrite> = {}) =>
  new ProfileSelection(
    { experience: null, education: null, bullets: {}, groups_order: [], ...patch } as ProfileWrite,
    content,
  );

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
