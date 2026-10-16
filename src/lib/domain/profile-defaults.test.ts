import { describe, expect, it } from "vitest";
import { newProfileDraft } from "./profile-defaults";

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
