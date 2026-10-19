import { describe, expect, it } from "vitest";
import { applicationOutcomeMessage, attachableBuilds, jobDomain } from "./application";

describe("jobDomain", () => {
  it("extracts the host without www", () => {
    expect(jobDomain("https://www.jobs.example.com/staff-eng?id=1")).toBe("jobs.example.com");
    expect(jobDomain("https://example.com/x")).toBe("example.com");
  });

  it("returns the input when it is not a URL", () => {
    expect(jobDomain("not a url")).toBe("not a url");
  });
});

describe("attachableBuilds", () => {
  it("keeps only completed builds", () => {
    const builds = [
      { id: "a", status: "completed" },
      { id: "b", status: "failed" },
      { id: "c", status: "running" },
    ];
    expect(attachableBuilds(builds).map((b) => b.id)).toEqual(["a"]);
  });
});

describe("applicationOutcomeMessage", () => {
  it("has copy for each terminal status and a fallback", () => {
    expect(applicationOutcomeMessage("submitted")).toMatch(/Submitted/);
    expect(applicationOutcomeMessage("expired")).toMatch(/closed automatically/);
    expect(applicationOutcomeMessage("weird")).toBe("This application is weird.");
  });
});
