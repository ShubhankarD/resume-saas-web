import { describe, expect, it } from "vitest";
import { filterSkillGroups, toTokens } from "./skills";

describe("toTokens", () => {
  it("splits on commas, trims, and drops blanks", () => {
    expect(toTokens(" GCP, AWS ,, Terraform ")).toEqual(["GCP", "AWS", "Terraform"]);
  });

  it("degrades to one chip without commas and none when empty", () => {
    expect(toTokens("Go")).toEqual(["Go"]);
    expect(toTokens("  ")).toEqual([]);
  });
});

describe("filterSkillGroups", () => {
  const entries = [
    ["cloud", { label: "Cloud & Infra", text: "GCP, Terraform" }],
    ["lang", { label: "Languages", text: "Go, Python" }],
  ] as const;

  it("returns everything for a blank query", () => {
    expect(filterSkillGroups(entries, "  ")).toHaveLength(2);
  });

  it("matches key, label and text case-insensitively", () => {
    expect(filterSkillGroups(entries, "LANG").map(([k]) => k)).toEqual(["lang"]);
    expect(filterSkillGroups(entries, "infra").map(([k]) => k)).toEqual(["cloud"]);
    expect(filterSkillGroups(entries, "python").map(([k]) => k)).toEqual(["lang"]);
    expect(filterSkillGroups(entries, "rust")).toEqual([]);
  });
});
