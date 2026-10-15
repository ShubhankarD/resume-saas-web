import { describe, expect, it } from "vitest";
import { tallyTaglineUsage } from "./taglines";

describe("tallyTaglineUsage", () => {
  it("counts profiles per tagline key", () => {
    const usage = tallyTaglineUsage([{ tagline: "a" }, { tagline: "b" }, { tagline: "a" }]);
    expect(usage.get("a")).toBe(2);
    expect(usage.get("b")).toBe(1);
    expect(usage.get("c")).toBeUndefined();
  });

  it("is empty for no profiles", () => {
    expect(tallyTaglineUsage([]).size).toBe(0);
  });
});
