import { describe, expect, it } from "vitest";
import { blankToUndefined } from "./text";

describe("blankToUndefined", () => {
  it("trims, and maps blank to undefined", () => {
    expect(blankToUndefined("  hi ")).toBe("hi");
    expect(blankToUndefined("   ")).toBeUndefined();
    expect(blankToUndefined("")).toBeUndefined();
  });
});
