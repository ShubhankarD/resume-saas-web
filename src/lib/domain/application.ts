/** Display helpers for apply jobs (the application list and detail pages). */

/** `jobs.example.com` for a posting URL (no `www.`); the input if it isn't a URL. */
export function jobDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Only a completed build has a usable PDF, so only those can be attached. */
export function attachableBuilds<T extends { status: string }>(builds: readonly T[]): T[] {
  return builds.filter((b) => b.status === "completed");
}

const OUTCOME_MESSAGES: Record<string, string> = {
  submitted: "Submitted. The browser session has been closed.",
  cancelled: "Cancelled. The browser session has been closed.",
  failed: "The agent couldn't complete this application.",
  expired: "No one reviewed this session in time, so it was closed automatically.",
};

/** What to tell the user about a finished application. */
export function applicationOutcomeMessage(status: string): string {
  return OUTCOME_MESSAGES[status] ?? `This application is ${status}.`;
}
