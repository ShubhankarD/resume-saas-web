import { describe, expect, it } from "vitest";
import { parseDeterministic, parseJudgeReport } from "./evaluation-report";

const deterministic = {
  page_fit: { page_count: 1, underfilled: false, fill_pct: 92.5 },
  style_compliance: { bullets_total: 8, over_word_limit: [], multi_bold: [] },
  xyz_format: { bullets_with_bold: 5, back_loaded: [{ id: "b1", position_ratio: 0.8 }] },
  duplicate_bullets: [{ type: "tag_overlap", message: "b1 and b2 overlap" }],
  tag_coverage: { tags_total: 4, matched: ["python"], ratio: 0.25 },
};

const judge = {
  requirement_coverage: [
    { requirement: "Python", status: "covered", evidence_bullet_id: "b1", note: "yes" },
    { requirement: "Rust", status: "gap", evidence_bullet_id: null, note: "none" },
  ],
  technical_fit: { score: 7, reason: "ok" },
  seniority_fit: { score: 8, reason: "ok" },
  domain_fit: { score: 6, reason: "ok" },
  strengths: ["a"],
  gaps: [],
  unverifiable_claims: [],
  incoherent_bullets: [],
  recommendation: "Apply",
};

describe("parseDeterministic", () => {
  it("accepts the backend shape", () => {
    expect(parseDeterministic(deterministic)?.page_fit.fill_pct).toBe(92.5);
  });

  it("returns null for null, a wrong shape, or a missing section", () => {
    expect(parseDeterministic(null)).toBeNull();
    expect(parseDeterministic({})).toBeNull();
    expect(parseDeterministic({ ...deterministic, tag_coverage: undefined })).toBeNull();
  });
});

describe("parseJudgeReport", () => {
  it("accepts the backend shape, including a null evidence id for a gap", () => {
    expect(parseJudgeReport(judge)?.requirement_coverage[1].evidence_bullet_id).toBeNull();
  });

  it("rejects an unknown coverage status and a non-object", () => {
    const bad = {
      ...judge,
      requirement_coverage: [{ ...judge.requirement_coverage[0], status: "maybe" }],
    };
    expect(parseJudgeReport(bad)).toBeNull();
    expect(parseJudgeReport("nope")).toBeNull();
    expect(parseJudgeReport(undefined)).toBeNull();
  });
});
