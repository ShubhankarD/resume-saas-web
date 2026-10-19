import { describe, expect, it } from "vitest";
import { apiUpload, buildFormData, buildPath } from "@/lib/api/client";

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

describe("buildFormData", () => {
  it("appends strings and blobs and skips null/undefined", () => {
    const file = new File(["x"], "a.txt");
    const form = buildFormData({ text: "hi", file, title: undefined, company: null });
    expect([...form.keys()].sort()).toEqual(["file", "text"]);
    expect(form.get("text")).toBe("hi");
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("keeps empty strings (callers decide what counts as empty)", () => {
    expect(buildFormData({ title: "" }).get("title")).toBe("");
  });
});

describe("apiUpload typing", () => {
  it("checks field names and required fields against the schema", () => {
    const never = () => {
      // @ts-expect-error — `file` is required for content import
      void apiUpload("/api/v1/content/import", {});
      // @ts-expect-error — unknown field
      void apiUpload("/api/v1/jds/", { nope: "x" });
      // @ts-expect-error — a JSON-only path is not a multipart path
      void apiUpload("/api/v1/health", {});
    };
    expect(never).toBeTypeOf("function");
  });
});
