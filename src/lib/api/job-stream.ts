import { authFetch } from "@/lib/api/client";
import { SseParser } from "@/lib/sse";

/**
 * The shared SSE event vocabulary both curation (F6) and apply (F7) jobs
 * publish — see `app/services/progress_publisher.py` in the backend for
 * the exact real payload shapes this mirrors 1:1:
 *   - `tool_call` / `score` — in-progress events (curation's `curate()`
 *     loop, `app/services/curation/loop.py`, emits both).
 *   - `completed` / `failed` / `awaiting_review` / `cancelled` — the four
 *     terminal event types (`TERMINAL_EVENT_TYPES` in that same module,
 *     #148) that end the backend's Redis pub/sub stream.
 */
export type ToolCallEvent = { type: "tool_call"; name: string; args_summary: string; turn: number };
export type ScoreEvent = { type: "score"; overall_score: number; coverage_score: number };
export type CompletedEvent = { type: "completed"; result_id: string | null };
export type FailedEvent = { type: "failed"; error: string };
export type AwaitingReviewEvent = { type: "awaiting_review"; summary: string | null };
export type CancelledEvent = { type: "cancelled" };

export type TerminalEvent = CompletedEvent | FailedEvent | AwaitingReviewEvent | CancelledEvent;
export type JobProgressEvent = ToolCallEvent | ScoreEvent | TerminalEvent;
export type TerminalEventType = TerminalEvent["type"];

/** Matches the backend's own `TERMINAL_EVENT_TYPES` frozenset exactly
 * (progress_publisher.py) — all four, per #148, not just
 * completed/failed. */
const TERMINAL_EVENT_TYPES: ReadonlySet<string> = new Set<TerminalEventType>([
  "completed",
  "failed",
  "awaiting_review",
  "cancelled",
]);

export function isTerminalEvent(event: JobProgressEvent): event is TerminalEvent {
  return TERMINAL_EVENT_TYPES.has(event.type);
}

/**
 * A source of job progress events. The hook depends on this interface, not
 * on fetch, so tests (or a future native `EventSource` once the backend
 * supports a non-header auth) can swap the transport.
 */
export type JobStreamTransport = (
  path: string,
  options: { signal: AbortSignal; onOpen?: () => void },
) => AsyncIterable<JobProgressEvent>;

/**
 * The default transport. Deliberately NOT the browser's native
 * `EventSource`: job stream endpoints are Bearer-token authenticated the
 * same way every other endpoint is (`OAuth2PasswordBearer`,
 * `app/core/security.py`) — there's no query-string token fallback — and
 * `EventSource` has no way to attach a custom `Authorization` header.
 * Instead this reads the response body via `authFetch` (same Bearer header
 * + one-shot 401-refresh-retry as every other authed call) and parses it
 * with SseParser. Ends after the first terminal event.
 */
export async function* fetchJobStream(
  path: string,
  { signal, onOpen }: { signal: AbortSignal; onOpen?: () => void },
): AsyncGenerator<JobProgressEvent> {
  const response = await authFetch(path, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`stream request failed with status ${response.status}`);
  }
  onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = new SseParser();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      for (const payload of parser.push(decoder.decode(value, { stream: true }))) {
        let event: JobProgressEvent;
        try {
          event = JSON.parse(payload) as JobProgressEvent;
        } catch {
          // Malformed frame — skip it rather than tearing down the whole
          // stream over one bad message.
          continue;
        }
        yield event;
        if (isTerminalEvent(event)) return;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}
