import { describe, expect, it } from "vitest";
import { defaultTaglineKey, newProfileDraft, profileNameSchema } from "./profile-defaults";

describe("newProfileDraft", () => {
  it("carries the identity and starts as an empty one-page resume", () => {
    const draft = newProfileDraft({ name: "google-fde", label: "Google FDE" });
    expect(draft).toMatchObject({
      name: "google-fde",
      label: "Google FDE",
      max_pages: 1,
      density: "tight",
      experience: null,
      education: null,
      skills_order: [],
    });
  });
});

describe("defaultTaglineKey", () => {
  it("prefers 'default', else the first key, else 'default'", () => {
    expect(defaultTaglineKey(["fde", "default"])).toBe("default");
    expect(defaultTaglineKey(["fde", "swe"])).toBe("fde");
    expect(defaultTaglineKey([])).toBe("default");
  });

  it("is what a new profile starts on", () => {
    expect(newProfileDraft({ name: "a", label: "A" }, ["fde"]).tagline).toBe("fde");
  });
});

describe("profileNameSchema", () => {
  it("accepts id-like names up to 100 characters", () => {
    expect(profileNameSchema.safeParse("google-fde_2").success).toBe(true);
    expect(profileNameSchema.safeParse("a".repeat(100)).success).toBe(true);
    expect(profileNameSchema.safeParse("a".repeat(101)).success).toBe(false);
  });

  it("rejects empty and non-id names", () => {
    expect(profileNameSchema.safeParse("").error?.issues[0].message).toBe("Name is required");
    expect(profileNameSchema.safeParse("Has Space").success).toBe(false);
  });
});
