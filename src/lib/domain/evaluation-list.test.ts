import { describe, expect, it } from "vitest";
import {
  applyEvaluationQuery,
  distinctStatuses,
  toEvaluationRows,
  type EvaluationListQuery,
} from "./evaluation-list";

const row = (
  id: string,
  created_at: string,
  overall_score: number | null,
  status = "completed",
  profileLabel = "Profile",
  jdTitle = "Role",
) => ({ id, created_at, overall_score, status, profileLabel, jdTitle });

const rows = [
  row("a", "2026-01-01", 5, "completed", "Alpha", "Backend"),
  row("b", "2026-02-01", null, "failed", "Beta", "Frontend"),
  row("c", "2026-03-01", 9, "completed", "Gamma", "Platform"),
];
const q = (patch: Partial<EvaluationListQuery> = {}): EvaluationListQuery => ({
  search: "",
  sort: "newest",
  status: "all",
  ...patch,
});
const ids = (r: { id: string }[]) => r.map((x) => x.id);

describe("applyEvaluationQuery", () => {
  it("sorts newest, oldest, and by score with unscored last", () => {
    expect(ids(applyEvaluationQuery(rows, q()))).toEqual(["c", "b", "a"]);
    expect(ids(applyEvaluationQuery(rows, q({ sort: "oldest" })))).toEqual(["a", "b", "c"]);
    expect(ids(applyEvaluationQuery(rows, q({ sort: "score" })))).toEqual(["c", "a", "b"]);
  });

  it("filters by status and by profile or role name, case-insensitively", () => {
    expect(ids(applyEvaluationQuery(rows, q({ status: "failed" })))).toEqual(["b"]);
    expect(ids(applyEvaluationQuery(rows, q({ search: " ALPHA " })))).toEqual(["a"]);
    expect(ids(applyEvaluationQuery(rows, q({ search: "platf" })))).toEqual(["c"]);
    expect(applyEvaluationQuery(rows, q({ search: "zzz" }))).toEqual([]);
  });

  it("does not mutate its input", () => {
    const copy = [...rows];
    applyEvaluationQuery(rows, q({ sort: "oldest" }));
    expect(rows).toEqual(copy);
  });
});

describe("distinctStatuses", () => {
  it("is sorted and unique", () => {
    expect(distinctStatuses(rows)).toEqual(["completed", "failed"]);
  });
});

describe("toEvaluationRows", () => {
  const evals = [{ id: "e", profile_id: "p1", jd_id: "j1", status: "completed", created_at: "x" }];

  it("joins names, falling back to the id when unknown or not loaded yet", () => {
    const [joined] = toEvaluationRows(
      evals,
      [{ id: "p1", label: "Alpha" }],
      [{ id: "j1", title: null }],
    );
    expect(joined.profileLabel).toBe("Alpha");
    expect(joined.jdTitle).toBe("j1");
    expect(toEvaluationRows(evals, undefined, undefined)[0].profileLabel).toBe("p1");
  });
});
