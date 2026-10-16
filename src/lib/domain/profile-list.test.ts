import { describe, expect, it } from "vitest";
import { applyProfileListQuery } from "./profile-list";

const p = (label: string, name: string, max_pages = 1, tagline = "default") => ({
  label,
  name,
  max_pages,
  tagline,
});
const profiles = [p("Zeta", "a-name", 1), p("Alpha", "z-name", 2, "Data lead"), p("Beta", "m", 2)];

describe("applyProfileListQuery", () => {
  it("sorts by label, name, and pages (ties by label)", () => {
    const labels = (sort: "label" | "name" | "pages") =>
      applyProfileListQuery(profiles, { search: "", sort }).map((x) => x.label);
    expect(labels("label")).toEqual(["Alpha", "Beta", "Zeta"]);
    expect(labels("name")).toEqual(["Zeta", "Beta", "Alpha"]);
    expect(labels("pages")).toEqual(["Alpha", "Beta", "Zeta"]);
  });

  it("matches label, name or tagline case-insensitively, trimming the term", () => {
    const hit = (search: string) =>
      applyProfileListQuery(profiles, { search, sort: "label" }).map((x) => x.label);
    expect(hit("  DATA ")).toEqual(["Alpha"]);
    expect(hit("z-n")).toEqual(["Alpha"]);
    expect(hit("beta")).toEqual(["Beta"]);
    expect(hit("nope")).toEqual([]);
  });

  it("does not mutate its input", () => {
    const input = [...profiles];
    applyProfileListQuery(input, { search: "", sort: "name" });
    expect(input).toEqual(profiles);
  });
});
