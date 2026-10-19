import { describe, expect, it } from "vitest";
import { newCurationRequest } from "./curation-defaults";

describe("newCurationRequest", () => {
  it("carries the form values plus the backend's defaults", () => {
    expect(newCurationRequest({ jd_id: "j1", profile_name: "acme" })).toEqual({
      jd_id: "j1",
      profile_name: "acme",
      min_score: 8.5,
      max_score_gate_attempts: 3,
      max_turns: 40,
    });
  });
});
