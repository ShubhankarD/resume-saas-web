import { describe, expect, it } from "vitest";
import {
  bulletCreateSchema,
  groupCreateSchema,
  toBulletBody,
  toBulletCreateBody,
  toGroupCreateBody,
} from "./content-forms";

describe("bullet bodies", () => {
  it("omits a blank variant group and trims a set one", () => {
    expect(
      toBulletBody({ text: "t", tags: ["a"], variant_group: "  " }).variant_group,
    ).toBeUndefined();
    expect(toBulletBody({ text: "t", tags: [], variant_group: " v " }).variant_group).toBe("v");
  });

  it("adds the id on create", () => {
    expect(toBulletCreateBody({ id: "b1", text: "t", tags: [], variant_group: "" })).toEqual({
      id: "b1",
      text: "t",
      tags: [],
      variant_group: undefined,
    });
  });
});

describe("schemas", () => {
  const ok = { id: "b-1", text: "x", tags: [], variant_group: "" };

  it("validates a bullet id with the shared key rule", () => {
    expect(bulletCreateSchema.safeParse(ok).success).toBe(true);
    expect(bulletCreateSchema.safeParse({ ...ok, id: "Bad Id" }).success).toBe(false);
    expect(bulletCreateSchema.safeParse({ ...ok, id: "" }).error?.issues[0].message).toBe(
      "Id is required",
    );
  });

  it("requires bullet text", () => {
    expect(bulletCreateSchema.safeParse({ ...ok, text: "" }).success).toBe(false);
  });

  it("maps a group heading", () => {
    expect(groupCreateSchema.safeParse({ id: "g1", heading: "" }).success).toBe(true);
    expect(toGroupCreateBody({ id: "g1", heading: " Platform " })).toEqual({
      id: "g1",
      heading: "Platform",
    });
    expect(toGroupCreateBody({ id: "g1", heading: "" }).heading).toBeUndefined();
  });
});
