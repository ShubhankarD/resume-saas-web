"use client";

import { useEffect, useState } from "react";
import {
  fetchJobStream,
  isTerminalEvent,
  type JobProgressEvent,
  type JobStreamTransport,
  type TerminalEvent,
} from "@/lib/api/job-stream";

export type {
  AwaitingReviewEvent,
  CancelledEvent,
  CompletedEvent,
  FailedEvent,
  JobProgressEvent,
  ScoreEvent,
  TerminalEvent,
  TerminalEventType,
  ToolCallEvent,
} from "@/lib/api/job-stream";

export type JobProgressConnectionState = "idle" | "connecting" | "streaming" | "closed" | "error";

export interface UseJobProgressResult {
  events: JobProgressEvent[];
  connectionState: JobProgressConnectionState;
  connectionError: string | null;
  /** The terminal event that ended the stream, if any — convenience so
   * callers don't have to scan `events` themselves for the terminal one. */
  terminalEvent: TerminalEvent | null;
}

/**
 * Subscribes to a job's progress stream and accumulates the typed events
 * as they arrive, closing cleanly on unmount or once a terminal event is
 * seen. Only adapts a `JobStreamTransport` (default: `fetchJobStream`,
 * see lib/api/job-stream.ts for the transport and SSE details) to React
 * state.
 */
export function useJobProgress(
  streamPath: string | undefined,
  transport: JobStreamTransport = fetchJobStream,
): UseJobProgressResult {
  const [events, setEvents] = useState<JobProgressEvent[]>([]);
  const [connectionState, setConnectionState] = useState<JobProgressConnectionState>("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    setEvents([]);
    setConnectionError(null);

    if (!streamPath) {
      setConnectionState("idle");
      return;
    }

    const controller = new AbortController();
    setConnectionState("connecting");

    async function run(path: string) {
      try {
        const stream = transport(path, {
          signal: controller.signal,
          onOpen: () => setConnectionState("streaming"),
        });
        for await (const event of stream) {
          if (controller.signal.aborted) return;
          setEvents((prev) => [...prev, event]);
        }
        if (!controller.signal.aborted) setConnectionState("closed");
      } catch (err) {
        if (controller.signal.aborted) return;
        setConnectionError(err instanceof Error ? err.message : "stream connection failed");
        setConnectionState("error");
      }
    }

    void run(streamPath);

    return () => controller.abort();
  }, [streamPath, transport]);

  const terminalEvent = events.find(isTerminalEvent) ?? null;

  return { events, connectionState, connectionError, terminalEvent };
}
