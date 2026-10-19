import { describe, expect, it } from "vitest";
import { moveItem } from "./reorder";

describe("moveItem", () => {
  const list = ["a", "b", "c", "d"];

  it("moves forward and backward like arrayMove", () => {
    expect(moveItem(list, "a", "c")).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(list, "d", "b")).toEqual(["a", "d", "b", "c"]);
  });

  it("returns null when either id is unknown, and does not mutate", () => {
    expect(moveItem(list, "a", "zzz")).toBeNull();
    expect(moveItem(list, "zzz", "a")).toBeNull();
    expect(list).toEqual(["a", "b", "c", "d"]);
  });
});
