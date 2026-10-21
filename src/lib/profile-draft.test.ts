import { describe, expect, it } from "vitest";
import { ProfileSelection } from "@/lib/profile-draft";
import { contentFixture, draftFixture, roleFixture } from "@/lib/test-support/content-fixtures";

const content = contentFixture({
  skills: { lang: { label: "Languages", text: "TS" }, cloud: { label: "Cloud", text: "GCP" } },
  experience: [
    roleFixture("r1", { g1: ["b1", "b2"], g2: ["b3"] }),
    roleFixture("r2", { g3: [] }, { org: "B", dates: "2018" }),
  ],
  education: [
    { id: "e1", text: "BS" },
    { id: "e2", text: "MS" },
  ],
});

const draft = draftFixture;

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
