import { describe, expect, it } from "vitest";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { ProfileSelection } from "@/lib/profile-draft";

const content = {
  name: "Test",
  contact: [],
  taglines: {},
  skills: { lang: { label: "Languages", text: "TS" }, cloud: { label: "Cloud", text: "GCP" } },
  experience: [
    {
      id: "r1",
      title: "Eng",
      org: "A",
      dates: "2020",
      groups: [
        { id: "g1", bullets: [{ id: "b1" }, { id: "b2" }] },
        { id: "g2", bullets: [{ id: "b3" }] },
      ],
    },
    { id: "r2", title: "Eng", org: "B", dates: "2018", groups: [{ id: "g3", bullets: [] }] },
  ],
  education: [{ id: "e1" }, { id: "e2" }],
  application: {},
} as unknown as ContentIn;

const draft = (patch: Partial<ProfileWrite> = {}) =>
  ({
    experience: null,
    education: null,
    bullets: {},
    groups_order: [],
    skills_order: [],
    ...patch,
  }) as ProfileWrite;

describe("ProfileSelection", () => {
  it("defaults a null experience to every role in content order", () => {
    expect(new ProfileSelection(draft(), content).roleOrder()).toEqual(["r1", "r2"]);
    expect(new ProfileSelection(draft({ experience: ["r2", "r1"] }), content).roleOrder()).toEqual([
      "r2",
      "r1",
    ]);
  });

  it("orders a role's groups by the global order, appending unlisted ones", () => {
    const sel = new ProfileSelection(draft({ groups_order: ["g2"] }), content);
    expect(sel.groupOrder("r1")).toEqual(["g2", "g1"]);
  });

  it("rebuilds the global groups order after a reorder within one role", () => {
    const sel = new ProfileSelection(draft(), content);
    expect(sel.groupsOrderWith("r1", ["g2", "g1"])).toEqual(["g2", "g1", "g3"]);
  });

  it("respects an explicit empty bullet list as suppressed", () => {
    expect(new ProfileSelection(draft(), content).bulletIds("g1")).toEqual(["b1", "b2"]);
    expect(new ProfileSelection(draft({ bullets: { g1: [] } }), content).bulletIds("g1")).toEqual(
      [],
    );
  });

  it("treats empty skills_order as omitted but empty education as none", () => {
    const sel = new ProfileSelection(draft({ education: [] }), content);
    expect(sel.skillsOrder()).toEqual(["lang", "cloud"]);
    expect(sel.educationOrder()).toEqual([]);
    expect(new ProfileSelection(draft(), content).educationOrder()).toEqual(["e1", "e2"]);
  });
});
