import { describe, expect, it, vi } from "vitest";
import { surfacedElsewhere } from "./form-submit";

describe("surfacedElsewhere", () => {
  it("passes arguments through and resolves to undefined", async () => {
    const handler = vi.fn(async (a: number, b: string) => `${a}${b}`);
    await expect(surfacedElsewhere(handler)(1, "x")).resolves.toBeUndefined();
    expect(handler).toHaveBeenCalledWith(1, "x");
  });

  it("swallows a rejection instead of propagating it", async () => {
    const wrapped = surfacedElsewhere(async () => {
      throw new Error("boom");
    });
    await expect(wrapped()).resolves.toBeUndefined();
  });

  it("swallows a synchronous throw too", async () => {
    const wrapped = surfacedElsewhere(() => {
      throw new Error("sync boom");
    });
    await expect(wrapped()).resolves.toBeUndefined();
  });

  it("skips the code after a failing await", async () => {
    const after = vi.fn();
    await surfacedElsewhere(async () => {
      await Promise.reject(new Error("boom"));
      after();
    })();
    expect(after).not.toHaveBeenCalled();
  });

  it("calls the handler synchronously so event objects stay valid", () => {
    const seen: string[] = [];
    void surfacedElsewhere(async (e: { currentTarget: string }) => {
      seen.push(e.currentTarget);
    })({ currentTarget: "form" });
    expect(seen).toEqual(["form"]);
  });
});
