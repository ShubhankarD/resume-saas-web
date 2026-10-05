import { describe, expect, it, vi } from "vitest";

const authFetch = vi.fn<(path: string, init?: RequestInit) => Promise<Response>>();
vi.mock("@/lib/api/client", () => ({
  authFetch: (path: string, init?: RequestInit) => authFetch(path, init),
}));

const { fetchJobStream } = await import("@/lib/api/job-stream");

function sseResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(body, { status: 200 });
}

async function collect(stream: AsyncIterable<unknown>) {
  const out: unknown[] = [];
  for await (const event of stream) out.push(event);
  return out;
}

describe("fetchJobStream", () => {
  it("yields events, skips malformed frames, and stops at a terminal event", async () => {
    authFetch.mockResolvedValueOnce(
      sseResponse([
        'data: {"type":"tool_call","name":"x","args_summary":"","turn":1}\n\n',
        "data: not json\n\n",
        'data: {"type":"completed","result_id":"r1"}\n\n',
        'data: {"type":"tool_call","name":"after","args_summary":"","turn":2}\n\n',
      ]),
    );
    const onOpen = vi.fn();
    const events = await collect(
      fetchJobStream("/stream", { signal: new AbortController().signal, onOpen }),
    );
    expect(onOpen).toHaveBeenCalledOnce();
    expect(events).toEqual([
      { type: "tool_call", name: "x", args_summary: "", turn: 1 },
      { type: "completed", result_id: "r1" },
    ]);
  });

  it("throws on a non-ok response", async () => {
    authFetch.mockResolvedValueOnce(new Response("nope", { status: 403 }));
    await expect(
      collect(fetchJobStream("/stream", { signal: new AbortController().signal })),
    ).rejects.toThrow(/403/);
  });
});
