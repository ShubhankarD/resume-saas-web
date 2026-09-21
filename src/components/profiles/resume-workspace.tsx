"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "cn";

const PANES = [
  { value: "edit", label: "Edit" },
  { value: "preview", label: "Preview" },
] as const;

type Pane = (typeof PANES)[number]["value"];

/**
 * The split-pane body of the resume editor (blueprint §11): editor 45% /
 * preview 55% from `lg` up, with the preview staying visible while editing.
 *
 * Below `lg` the split is *recomposed*, not shrunk (§37): an `[ Edit ]
 * [ Preview ]` segmented control swaps which pane is visible. Both panes
 * stay in the tree and are toggled with `hidden`, so the preview iframe is
 * mounted exactly once — remounting it would re-parse the srcDoc document
 * and flash on every pane switch.
 */
export function ResumeWorkspace({ editor, preview }: { editor: ReactNode; preview: ReactNode }) {
  const [pane, setPane] = useState<Pane>("edit");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const next = (index + delta + PANES.length) % PANES.length;
    setPane(PANES[next].value);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="min-w-0 space-y-4">
      <div
        role="tablist"
        aria-label="Editor or preview"
        className="inline-flex w-full items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50/80 p-1 sm:w-auto lg:hidden dark:border-slate-800 dark:bg-slate-900/60"
      >
        {PANES.map((item, index) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            aria-selected={pane === item.value}
            tabIndex={pane === item.value ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => setPane(item.value)}
            className={cn(
              "focus-visible:ring-ring/40 h-8 flex-1 rounded-md px-3 text-sm font-semibold transition-colors duration-150 outline-none focus-visible:ring-2 sm:flex-none",
              pane === item.value
                ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)] dark:bg-slate-800 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-8">
        <div className={cn("min-w-0", pane !== "edit" && "hidden lg:block")}>{editor}</div>
        <div className={cn("min-w-0", pane !== "preview" && "hidden lg:block")}>{preview}</div>
      </div>
    </div>
  );
}
