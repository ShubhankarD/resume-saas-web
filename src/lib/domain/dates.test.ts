import { describe, expect, it } from "vitest";
import { formatDate, newestFirst } from "./dates";

describe("formatDate", () => {
  it("formats month and day, optionally with the year", () => {
    expect(formatDate("2026-10-19T12:00:00Z")).toBe("Oct 19");
    expect(formatDate("2026-10-19T12:00:00Z", { withYear: true })).toBe("Oct 19, 2026");
  });
});

describe("newestFirst", () => {
  it("orders newest first, missing dates last, without mutating", () => {
    const items = [
      { id: "a", created_at: "2026-01-01" },
      { id: "b", created_at: null },
      { id: "c", created_at: "2026-03-01" },
      { id: "d" },
    ];
    expect(newestFirst(items).map((i) => i.id)).toEqual(["c", "a", "b", "d"]);
    expect(items[0].id).toBe("a");
  });
});
