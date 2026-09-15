import * as React from "react";
import { cn } from "cn";

type PageToolbarProps = {
  /** Leading cluster: back link, title, search, filters. */
  left?: React.ReactNode;
  /** Trailing cluster: save state, secondary actions, primary CTA. */
  right?: React.ReactNode;
  className?: string;
  /** Pins the bar to the top of its scroll container. */
  sticky?: boolean;
};

/**
 * A compact contextual bar (48–56px) that sits above a working area: search
 * and filters on a library screen, resume name plus export on the editor.
 *
 * It wraps rather than overflowing on narrow viewports, so at 375px the two
 * clusters stack instead of forcing horizontal page scroll.
 */
function PageToolbar({ left, right, className, sticky }: PageToolbarProps): React.ReactElement {
  return (
    <div
      data-slot="page-toolbar"
      className={cn(
        "flex min-h-12 w-full min-w-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2 md:px-6 dark:border-slate-800 dark:bg-slate-900",
        sticky && "sticky top-0 z-30",
        className,
      )}
    >
      <div
        data-slot="page-toolbar-left"
        className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3"
      >
        {left}
      </div>

      {right ? (
        <div
          data-slot="page-toolbar-right"
          className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3"
        >
          {right}
        </div>
      ) : null}
    </div>
  );
}

export { PageToolbar };
export type { PageToolbarProps };
