import { describe, expect, it } from "vitest";
import { buildPath } from "@/lib/api/client";

describe("buildPath", () => {
  it("fills and encodes path params", () => {
    expect(
      buildPath("/api/v1/content/roles/{role_id}/groups/{group_id}", {
        role_id: "a/b",
        group_id: "c d",
      }),
    ).toBe("/api/v1/content/roles/a%2Fb/groups/c%20d");
  });

  it("appends defined query params only", () => {
    expect(buildPath("/verify", undefined, { token: "x y", skip: undefined })).toBe(
      "/verify?token=x+y",
    );
  });

  it("throws on a missing param", () => {
    expect(() => buildPath("/builds/{build_id}", {})).toThrow(/build_id/);
  });
});
