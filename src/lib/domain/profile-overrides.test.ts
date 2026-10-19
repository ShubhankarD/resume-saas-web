import { describe, expect, it } from "vitest";
import {
  withBulletToggled,
  withSkillOverride,
  withSkillToggled,
  withTextOverride,
} from "./profile-overrides";

describe("withTextOverride", () => {
  it("sets a changed value without touching other keys or the input", () => {
    const input = { a: "x" };
    expect(withTextOverride(input, "b", "new", "orig")).toEqual({ a: "x", b: "new" });
    expect(input).toEqual({ a: "x" });
  });

  it("drops the key when blank or equal to the original", () => {
    expect(withTextOverride({ b: "old" }, "b", "  ", "orig")).toEqual({});
    expect(withTextOverride({ b: "old" }, "b", "orig", "orig")).toEqual({});
  });

  it("treats a missing map as empty", () => {
    expect(withTextOverride(undefined, "k", "v", undefined)).toEqual({ k: "v" });
  });
});

describe("withBulletToggled", () => {
  const all = ["b1", "b2", "b3"];

  it("excludes from the explicit selection, or from all when unset", () => {
    expect(withBulletToggled(["b3", "b1"], all, "b3", false)).toEqual(["b1"]);
    expect(withBulletToggled(undefined, all, "b2", false)).toEqual(["b1", "b3"]);
  });

  it("re-includes at the content position", () => {
    expect(withBulletToggled(["b3"], all, "b1", true)).toEqual(["b1", "b3"]);
    expect(withBulletToggled([], all, "b2", true)).toEqual(["b2"]);
  });
});

describe("withSkillOverride", () => {
  const original = { label: "Cloud", text: "GCP" };

  it("records an edited field, starting from the content values", () => {
    expect(withSkillOverride(undefined, "cloud", original, "text", "GCP, AWS")).toEqual({
      cloud: { label: "Cloud", text: "GCP, AWS" },
    });
  });

  it("removes the override once it matches the content again", () => {
    const existing = { cloud: { label: "Cloud", text: "GCP, AWS" } };
    expect(withSkillOverride(existing, "cloud", original, "text", "GCP")).toEqual({});
  });
});

describe("withSkillToggled", () => {
  it("adds up to the limit and refuses beyond it", () => {
    expect(withSkillToggled(["a"], "b", true, 2)).toEqual(["a", "b"]);
    expect(withSkillToggled(["a", "b"], "c", true, 2)).toBeNull();
  });

  it("always allows removing", () => {
    expect(withSkillToggled(["a", "b"], "a", false, 2)).toEqual(["b"]);
  });
});
