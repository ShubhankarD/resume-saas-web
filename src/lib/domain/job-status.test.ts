import { describe, expect, it } from "vitest";
import {
  APPLICATION_STATUSES,
  isCancellableStatus,
  isTerminalStatus,
  statusMeta,
} from "@/lib/domain/job-status";

describe("job status model", () => {
  it("treats only pending/running as live for generic jobs", () => {
    expect(isTerminalStatus("job", "pending")).toBe(false);
    expect(isTerminalStatus("job", "running")).toBe(false);
    for (const s of ["completed", "failed", "cancelled"]) {
      expect(isTerminalStatus("job", s)).toBe(true);
    }
  });

  it("mirrors the backend's _CANCELLABLE_STATUSES for applications", () => {
    const cancellable = APPLICATION_STATUSES.filter((s) => isCancellableStatus("application", s));
    expect(cancellable).toEqual(["queued", "running", "filling", "awaiting_review"]);
  });

  it("keeps cancellable and non-terminal identical for applications", () => {
    for (const s of APPLICATION_STATUSES) {
      expect(isCancellableStatus("application", s)).toBe(!isTerminalStatus("application", s));
    }
  });

  it("tones success, failure and in-progress badges", () => {
    expect(statusMeta("application", "submitted").tone).toBe("default");
    expect(statusMeta("application", "expired").tone).toBe("destructive");
    expect(statusMeta("job", "running").tone).toBe("secondary");
  });

  it("treats unknown statuses as terminal and neutral", () => {
    expect(statusMeta("job", "mystery")).toEqual({
      terminal: true,
      cancellable: false,
      tone: "secondary",
    });
    expect(isTerminalStatus("job", "toString")).toBe(true);
  });
});
