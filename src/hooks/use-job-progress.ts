"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/api/client";

/**
 * The shared SSE event vocabulary both curation (F6) and apply (F7) jobs
 * publish — see `app/services/progress_publisher.py` in the backend for
 * the exact real payload shapes this mirrors 1:1:
 *   - `tool_call` / `score` — in-progress events (curation's `curate()`
 *     loop, `app/services/curation/loop.py`, emits both).
 *   - `completed` / `failed` / `awaiting_review` / `cancelled` — the four
 *     terminal event types (`TERMINAL_EVENT_TYPES` in that same module,
 *     #148) that end the backend's Redis pub/sub stream and this hook's
 *     connection alike.
 */
export type ToolCallEvent = { type: "tool_call"; name: string; args_summary: string; turn: number };
export type ScoreEvent = { type: "score"; overall_score: number; coverage_score: number };
export type CompletedEvent = { type: "completed"; result_id: string | null };
export type FailedEvent = { type: "failed"; error: string };
export type AwaitingReviewEvent = { type: "awaiting_review"; summary: string | null };
export type CancelledEvent = { type: "cancelled" };

export type JobProgressEvent =
  | ToolCallEvent
  | ScoreEvent
  | CompletedEvent
  | FailedEvent
  | AwaitingReviewEvent
  | CancelledEvent;

export type TerminalEventType = "completed" | "failed" | "awaiting_review" | "cancelled";

/** Matches the backend's own `TERMINAL_EVENT_TYPES` frozenset exactly
 * (progress_publisher.py) — all four, per #148, not just
 * completed/failed. */
const TERMINAL_EVENT_TYPES: ReadonlySet<string> = new Set([
  "completed",
  "failed",
  "awaiting_review",
  "cancelled",
]);

export type JobProgressConnectionState = "idle" | "connecting" | "streaming" | "closed" | "error";

export interface UseJobProgressResult {
  events: JobProgressEvent[];
  connectionState: JobProgressConnectionState;
  connectionError: string | null;
  /** The terminal event that ended the stream, if any — convenience so
   * callers don't have to scan `events` themselves for the terminal one. */
  terminalEvent: (CompletedEvent | FailedEvent | AwaitingReviewEvent | CancelledEvent) | null;
}

/**
 * Subscribes to a job's SSE progress stream and accumulates the typed
 * events as they arrive, closing cleanly on unmount or once a terminal
 * event is seen.
 *
 * Deliberately does NOT use the browser's native `EventSource`:
 * `GET /api/v1/curations/{id}/stream` (and the generic
 * `GET /api/v1/jobs/{id}/stream` F7 will use) is Bearer-token authenticated
 * the same way every other endpoint is (`OAuth2PasswordBearer`,
 * `app/core/security.py`) — there's no query-string token fallback — and
 * `EventSource` has no way to attach a custom `Authorization` header.
 * Confirmed by reading `app/core/security.py`'s `get_current_user`, not
 * assumed. Instead this reads the same response body `EventSource` would,
 * via `authFetch` (so it gets the same Bearer header + one-shot
 * 401-refresh-retry every other authed call gets) and a hand-rolled
 * incremental SSE frame parser — frames are separated by a blank line and
 * carry one or more `data:` lines, matching sse-starlette's
 * `EventSourceResponse` framing that the backend's
 * `yield {"data": json.dumps(data)}` produces.
 */
export function useJobProgress(streamPath: string | undefined): UseJobProgressResult {
  const [events, setEvents] = useState<JobProgressEvent[]>([]);
  const [connectionState, setConnectionState] = useState<JobProgressConnectionState>("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const streamPathRef = useRef(streamPath);
  streamPathRef.current = streamPath;

  useEffect(() => {
    setEvents([]);
    setConnectionError(null);

    if (!streamPath) {
      setConnectionState("idle");
      return;
    }

    const controller = new AbortController();
    let stopped = false;
    setConnectionState("connecting");

    async function run() {
      try {
        const response = await authFetch(streamPath as string, { signal: controller.signal });
        if (!response.ok || !response.body) {
          throw new Error(`stream request failed with status ${response.status}`);
        }
        if (stopped) return;
        setConnectionState("streaming");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!stopped) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let separatorIndex: number;
          while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);

            const dataLines = frame
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trimStart());
            if (dataLines.length === 0) continue; // e.g. a keepalive comment frame

            try {
              const event = JSON.parse(dataLines.join("\n")) as JobProgressEvent;
              setEvents((prev) => [...prev, event]);
              if (TERMINAL_EVENT_TYPES.has(event.type)) {
                stopped = true;
                setConnectionState("closed");
                await reader.cancel();
                return;
              }
            } catch {
              // Malformed frame — skip it rather than tearing down the
              // whole stream over one bad message.
            }
          }
        }
        if (!stopped) setConnectionState("closed");
      } catch (err) {
        if (controller.signal.aborted) return;
        setConnectionError(err instanceof Error ? err.message : "stream connection failed");
        setConnectionState("error");
      }
    }

    void run();

    return () => {
      stopped = true;
      controller.abort();
    };
  }, [streamPath]);

  const terminalEvent =
    (events.find((e): e is CompletedEvent | FailedEvent | AwaitingReviewEvent | CancelledEvent =>
      TERMINAL_EVENT_TYPES.has(e.type),
    ) as CompletedEvent | FailedEvent | AwaitingReviewEvent | CancelledEvent | undefined) ?? null;

  return { events, connectionState, connectionError, terminalEvent };
}
