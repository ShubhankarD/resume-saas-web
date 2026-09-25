/**
 * Per-route content width for the app shell.
 *
 * A single global `max-width` is a marketing-site habit: line length only
 * matters for prose and forms, not for grids, boards or canvases. So the
 * cap is chosen per surface instead:
 *
 * - `full`  — workspaces where extra width is directly useful. The resume
 *             editor is the case: a wider viewport means a wider preview
 *             pane. (The sheet itself stays 816px — `fitScale` in
 *             live-preview.tsx clamps to 1 — so it never distorts.)
 * - `wide`  — data views. More columns means more content visible; card
 *             size stays fixed so the scan target doesn't move.
 * - `default` — reading- and form-heavy screens, where an unbounded line
 *             length actively hurts.
 */
export type ContentWidth = "default" | "wide" | "full";

export const CONTENT_WIDTH_CLASS: Record<ContentWidth, string> = {
  default: "max-w-[1280px]",
  wide: "max-w-[1600px]",
  full: "max-w-none",
};

/** Routes whose top level is a data view rather than a form or document. */
const WIDE_ROUTES = new Set([
  "/dashboard",
  "/profiles",
  "/jds",
  "/evaluations",
  "/content",
  "/curations",
  "/applications",
]);

export function contentWidthFor(pathname: string): ContentWidth {
  // Detail routes first — they are more specific than their list parents.
  if (pathname.startsWith("/profiles/")) return "full"; // the editor workspace
  if (pathname.startsWith("/jds/")) return "default"; // reading a posting
  if (pathname.startsWith("/evaluations/")) return "default"; // reading results
  if (pathname.startsWith("/content/")) return "default"; // section editors
  if (pathname.startsWith("/curations/")) return "default"; // one job's activity feed
  if (pathname.startsWith("/applications/")) return "full"; // the live VNC session

  return WIDE_ROUTES.has(pathname) ? "wide" : "default";
}
