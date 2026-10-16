import { describe, expect, it } from "vitest";
import { labelFor, nextStep, recentEvaluations, summarizeScores } from "./dashboard";

describe("summarizeScores", () => {
  it("finds the best score among scored runs only", () => {
    expect(
      summarizeScores([{ overall_score: 6 }, { overall_score: null }, {}, { overall_score: 8 }]),
    ).toEqual({ best: 8, scoredCount: 2 });
  });

  it("treats a zero score as scored", () => {
    expect(summarizeScores([{ overall_score: 0 }])).toEqual({ best: 0, scoredCount: 1 });
  });

  it("has no best when nothing is scored", () => {
    expect(summarizeScores([])).toEqual({ best: null, scoredCount: 0 });
  });
});

describe("recentEvaluations", () => {
  const evals = ["2026-01-02", "2026-01-05", "2026-01-01", "2026-01-04"].map((created_at) => ({
    created_at,
  }));

  it("orders newest first and limits", () => {
    expect(recentEvaluations(evals, 2).map((e) => e.created_at)).toEqual([
      "2026-01-05",
      "2026-01-04",
    ]);
  });

  it("does not mutate its input", () => {
    const copy = [...evals];
    recentEvaluations(evals);
    expect(evals).toEqual(copy);
  });
});

describe("nextStep", () => {
  it("walks profile → job description → evaluation", () => {
    expect(nextStep({ profiles: 0, jds: 3 }).href).toBe("/profiles");
    expect(nextStep({ profiles: 1, jds: 0 }).label).toBe("Add a job description");
    expect(nextStep({ profiles: 1, jds: 1 }).label).toBe("Run an evaluation");
  });
});

describe("labelFor", () => {
  const items = [
    { id: "a", title: "Eng" },
    { id: "b", title: null },
  ];
  it("returns the picked field or the fallback", () => {
    expect(labelFor(items, "a", (i) => i.title, "Untitled")).toBe("Eng");
    expect(labelFor(items, "b", (i) => i.title, "Untitled")).toBe("Untitled");
    expect(labelFor(items, "zzz", (i) => i.title, "Untitled")).toBe("Untitled");
    expect(labelFor<(typeof items)[number]>(undefined, "a", (i) => i.title, "Untitled")).toBe(
      "Untitled",
    );
  });
});
