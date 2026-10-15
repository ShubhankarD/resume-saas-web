import { describe, expect, it } from "vitest";
import { toFieldError } from "@/lib/api/field-errors";
import { ApiError, getErrorField } from "@/lib/api/http";

const scoped = new ApiError(422, { detail: "could not resolve host 'x'", field: "url" });
const unscoped = new ApiError(422, { detail: "Something broke" });

describe("getErrorField", () => {
  it("reads the field of a field-scoped backend error", () => {
    expect(getErrorField(scoped)).toBe("url");
  });

  it("is undefined when the body has no field", () => {
    expect(getErrorField(unscoped)).toBeUndefined();
  });

  it("ignores FastAPI validation arrays, non-string fields and empty fields", () => {
    expect(
      getErrorField(new ApiError(422, { detail: [{ loc: ["body", "x"], msg: "bad", type: "v" }] })),
    ).toBeUndefined();
    expect(getErrorField(new ApiError(422, { detail: "x", field: 3 }))).toBeUndefined();
    expect(getErrorField(new ApiError(422, { detail: "x", field: "" }))).toBeUndefined();
  });

  it("is undefined for non-ApiErrors and non-object bodies", () => {
    expect(getErrorField(new Error("x"))).toBeUndefined();
    expect(getErrorField(null)).toBeUndefined();
    expect(getErrorField(new ApiError(500, "plain text"))).toBeUndefined();
  });
});

describe("toFieldError", () => {
  it("maps a server error onto a field the form renders", () => {
    expect(toFieldError(scoped, ["url"])).toEqual({
      field: "url",
      message: "could not resolve host 'x'",
    });
  });

  it("falls back (null) for an error without a field", () => {
    expect(toFieldError(unscoped, ["url"])).toBeNull();
  });

  it("falls back for a field this form does not render, so the message is not dropped", () => {
    expect(toFieldError(scoped, ["text"])).toBeNull();
  });

  it("falls back for no error", () => {
    expect(toFieldError(null, ["url"])).toBeNull();
  });
});
