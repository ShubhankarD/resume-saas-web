import { describe, expect, it } from "vitest";
import { contentKeySchema } from "./content-key";

describe("contentKeySchema", () => {
  it("accepts lowercase keys with - and _", () => {
    expect(contentKeySchema().safeParse("cloud-infra_2").success).toBe(true);
  });

  it("rejects empty with the given message", () => {
    const result = contentKeySchema("Id is required").safeParse("");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Id is required");
  });

  it("rejects a key that is already taken, with the given message", () => {
    const schema = contentKeySchema("Key is required", ["cloud"], "Taken");
    expect(schema.safeParse("data").success).toBe(true);
    const result = schema.safeParse("cloud");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Taken");
  });

  it("rejects uppercase, leading separators, spaces and over-long keys", () => {
    for (const bad of ["Cloud", "-cloud", "_cloud", "a b", "a".repeat(81)]) {
      expect(contentKeySchema().safeParse(bad).success).toBe(false);
    }
  });
});
