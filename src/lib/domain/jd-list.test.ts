import { describe, expect, it } from "vitest";
import {
  ALL_SOURCES,
  DEFAULT_JD_LIST_QUERY,
  applyJdListQuery,
  distinctSourceTypes,
} from "./jd-list";

const jd = (
  title: string | null,
  company: string | null,
  source_type: string,
  created_at: string,
) => ({ title, company, source_type, created_at });

const jds = [
  jd("Staff Engineer", "Acme", "text", "2026-01-02"),
  jd("Designer", "Globex", "url", "2026-01-03"),
  jd(null, null, "file", "2026-01-01"),
];

describe("applyJdListQuery", () => {
  it("sorts newest first by default without mutating the input", () => {
    const copy = [...jds];
    const out = applyJdListQuery(jds, DEFAULT_JD_LIST_QUERY);
    expect(out.map((j) => j.created_at)).toEqual(["2026-01-03", "2026-01-02", "2026-01-01"]);
    expect(jds).toEqual(copy);
  });

  it("supports every sort order", () => {
    const q = DEFAULT_JD_LIST_QUERY;
    expect(applyJdListQuery(jds, { ...q, sort: "oldest" })[0].created_at).toBe("2026-01-01");
    expect(applyJdListQuery(jds, { ...q, sort: "title" })[0].title).toBeNull();
    expect(applyJdListQuery(jds, { ...q, sort: "company" })[1].company).toBe("Acme");
  });

  it("searches title and company case-insensitively and ignores padding", () => {
    const q = { ...DEFAULT_JD_LIST_QUERY, search: "  GLOBEX " };
    expect(applyJdListQuery(jds, q).map((j) => j.title)).toEqual(["Designer"]);
    expect(applyJdListQuery(jds, { ...q, search: "staff" })).toHaveLength(1);
  });

  it("filters by source", () => {
    const q = { ...DEFAULT_JD_LIST_QUERY, source: "url" };
    expect(applyJdListQuery(jds, q)).toHaveLength(1);
    expect(applyJdListQuery(jds, { ...q, source: ALL_SOURCES })).toHaveLength(3);
  });
});

describe("distinctSourceTypes", () => {
  it("returns sorted unique types", () => {
    expect(distinctSourceTypes([...jds, jd("x", "y", "url", "2026-02-01")])).toEqual([
      "file",
      "text",
      "url",
    ]);
  });
});
