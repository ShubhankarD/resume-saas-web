import { describe, expect, it } from "vitest";
import { countBullets, emptyContent, summarizeContent } from "./content-overview";

const role = (bulletsPerGroup: number[]) => ({
  groups: bulletsPerGroup.map((n) => ({ bullets: Array.from({ length: n }, () => ({})) })),
});

describe("summarizeContent", () => {
  it("is all zeros for an empty record", () => {
    expect(summarizeContent(emptyContent("Jane"))).toEqual({
      roleCount: 0,
      bulletCount: 0,
      skillCount: 0,
      taglineCount: 0,
      educationCount: 0,
      sectionsWithContent: 0,
      completeness: 0,
      totalEntries: 0,
    });
  });

  it("counts bullets across roles and groups, and sections with content", () => {
    const summary = summarizeContent({
      experience: [role([2, 1]), role([4])],
      skills: { a: {}, b: {} },
      taglines: {},
      education: [],
    });
    expect(summary.roleCount).toBe(2);
    expect(summary.bulletCount).toBe(7);
    expect(summary.skillCount).toBe(2);
    expect(summary.sectionsWithContent).toBe(2);
    expect(summary.completeness).toBe(50);
    expect(summary.totalEntries).toBe(11);
  });

  it("rounds coverage to a whole percent", () => {
    const summary = summarizeContent({
      experience: [role([])],
      skills: { a: {} },
      taglines: { t: "x" },
      education: [],
    });
    expect(summary.completeness).toBe(75);
  });
});

describe("emptyContent", () => {
  it("only carries the name", () => {
    expect(emptyContent("Jane")).toEqual({
      name: "Jane",
      contact: [],
      taglines: {},
      skills: {},
      experience: [],
      education: [],
      application: {},
    });
  });
});

describe("countBullets", () => {
  it("sums bullets across roles and groups", () => {
    expect(countBullets([role([2, 1]), role([4]), role([])])).toBe(7);
    expect(countBullets([])).toBe(0);
  });
});
