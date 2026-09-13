import { cn } from "cn";

/**
 * The "resumeaid.app" wordmark — live text (not an image/SVG), so it
 * stays crisp and left-aligns naturally with surrounding copy at any
 * size. Ported verbatim from resumeaid-coming-soon/theme.css: the "ai"
 * inside "aid" sits in a diagonal-corner teal chip with an amber dot
 * standing in for the tittle of a dotless "ı" (U+0131), so the dot's
 * position is ours to control rather than fighting the font's own
 * glyph. See globals.css's "Wordmark" section for the CSS this renders
 * against — keep both in sync with theme.css if the brand changes.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark", className)}>
      resume
      <span className="ai">
        a
        <span className="i">
          ı<i className="dot" />
        </span>
      </span>
      d<span className="suffix">.app</span>
    </span>
  );
}
