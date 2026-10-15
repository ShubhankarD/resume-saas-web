/**
 * Incremental Server-Sent Events frame parser — pure, no I/O. Matches
 * sse-starlette's `EventSourceResponse` framing (what the backend's
 * `yield {"data": json.dumps(data)}` produces): frames separated by a blank
 * line, each carrying one or more `data:` lines.
 *
 * Feed it decoded text chunks in arrival order; it buffers partial frames
 * across chunk boundaries and returns each complete frame's joined `data`
 * payload. Frames with no `data:` line (keepalive comments) are dropped.
 */
export class SseParser {
  private buffer = "";

  push(chunk: string): string[] {
    this.buffer += chunk;
    const payloads: string[] = [];
    let separatorIndex: number;
    while ((separatorIndex = this.buffer.indexOf("\n\n")) !== -1) {
      const frame = this.buffer.slice(0, separatorIndex);
      this.buffer = this.buffer.slice(separatorIndex + 2);
      const dataLines = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart());
      if (dataLines.length > 0) payloads.push(dataLines.join("\n"));
    }
    return payloads;
  }
}
