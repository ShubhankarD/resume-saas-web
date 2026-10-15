import { describe, expect, it } from "vitest";
import { SseParser } from "@/lib/sse";

describe("SseParser", () => {
  it("returns the data payload of each complete frame", () => {
    const parser = new SseParser();
    expect(parser.push('data: {"a":1}\n\ndata: {"b":2}\n\n')).toEqual(['{"a":1}', '{"b":2}']);
  });

  it("buffers a frame split across chunks", () => {
    const parser = new SseParser();
    expect(parser.push('data: {"a"')).toEqual([]);
    expect(parser.push(":1}\n")).toEqual([]);
    expect(parser.push("\n")).toEqual(['{"a":1}']);
  });

  it("joins multi-line data and drops frames without data", () => {
    const parser = new SseParser();
    expect(parser.push(": keepalive\n\ndata: line1\ndata: line2\n\n")).toEqual(["line1\nline2"]);
  });
});
