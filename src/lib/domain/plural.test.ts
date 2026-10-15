import { describe, expect, it } from "vitest";
import { pluralize } from "./plural";

describe("pluralize", () => {
  it("uses the singular only for exactly one", () => {
    expect(pluralize(1, "skill")).toBe("1 skill");
    expect(pluralize(0, "skill")).toBe("0 skills");
    expect(pluralize(2, "group")).toBe("2 groups");
  });

  it("accepts an irregular plural", () => {
    expect(pluralize(2, "entry", "entries")).toBe("2 entries");
  });
});
