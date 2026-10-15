import { describe, expect, it } from "vitest";
import type { IntakeResponse } from "@/lib/api/content";
import { intakeToContent } from "./intake";

describe("intakeToContent", () => {
  it("drops intake-only fields and keeps every content field", () => {
    const draft: IntakeResponse = {
      name: "Jane",
      contact: [],
      taglines: { default: "Hi" },
      skills: {},
      experience: [],
      education: [],
      application: {},
      warnings: ["check the dates"],
    };
    const content = intakeToContent(draft);
    expect(content).not.toHaveProperty("warnings");
    expect(content.name).toBe("Jane");
    expect(content.taglines).toEqual({ default: "Hi" });
    expect(Object.keys(content).sort()).toEqual(
      [
        "application",
        "contact",
        "education",
        "experience",
        "name",
        "photo",
        "skills",
        "taglines",
      ].sort(),
    );
  });
});
