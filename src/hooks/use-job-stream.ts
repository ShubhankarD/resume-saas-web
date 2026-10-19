"use client";

import { useEffect, useState } from "react";
import { useJobProgress, type UseJobProgressResult } from "@/hooks/use-job-progress";

/**
 * A job detail page's live progress stream. The stream opens as soon as the
 * job is seen non-terminal and then stays open for the lifetime of the page
 * — a one-way `hasStreamed` latch rather than tying the stream to the
 * polled status. The detail poll can observe a terminal status before the
 * SSE stream has delivered every event still in flight, so closing on the
 * polled status truncated the feed; `useJobProgress` closes cleanly on its
 * own terminal event or on unmount.
 */
export function useJobStream(
  isNonTerminal: boolean,
  streamPath: string,
): UseJobProgressResult & { hasStreamed: boolean } {
  const [hasStreamed, setHasStreamed] = useState(false);
  useEffect(() => {
    if (isNonTerminal) setHasStreamed(true);
  }, [isNonTerminal]);

  const progress = useJobProgress(hasStreamed ? streamPath : undefined);
  return { ...progress, hasStreamed };
}
