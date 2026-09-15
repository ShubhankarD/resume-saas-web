"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "cn";

type CompactTabsItem = {
  value: string;
  label: string;
  /** Optional trailing count/status rendered next to the label. */
  badge?: React.ReactNode;
};

type CompactTabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: readonly CompactTabsItem[];
  className?: string;
  "aria-label"?: string;
};

/**
 * A compact 44px tab row for switching between sections of a working screen.
 *
 * Selection is signalled by stronger text *and* a bottom indicator (never by
 * colour alone, and never as an oversized pill). Built on Base UI's Tabs so
 * real tab semantics — `role="tablist"`, roving focus, arrow-key navigation
 * and `aria-selected` — come for free.
 *
 * Panels live outside this component: it is a controlled switch whose `value`
 * drives whatever the page renders below it.
 */
function CompactTabs({
  value,
  onValueChange,
  items,
  className,
  "aria-label": ariaLabel,
}: CompactTabsProps): React.ReactElement {
  const handleValueChange = React.useCallback(
    (nextValue: unknown) => {
      if (typeof nextValue === "string") {
        onValueChange(nextValue);
      }
    },
    [onValueChange],
  );

  return (
    <TabsPrimitive.Root
      data-slot="compact-tabs"
      value={value}
      onValueChange={handleValueChange}
      className={cn("w-full min-w-0", className)}
    >
      <TabsPrimitive.List
        data-slot="compact-tabs-list"
        aria-label={ariaLabel}
        className="flex h-11 w-full min-w-0 [scrollbar-width:none] items-stretch gap-1 overflow-x-auto border-b border-slate-200 [-ms-overflow-style:none] sm:gap-2 dark:border-slate-800 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <TabsPrimitive.Tab
            key={item.value}
            value={item.value}
            data-slot="compact-tabs-tab"
            className="focus-visible:ring-ring/50 -mb-px inline-flex shrink-0 items-center gap-1.5 rounded-t-md border-b-2 border-transparent px-3 text-[13px] font-medium whitespace-nowrap text-slate-500 transition-colors duration-150 outline-none select-none hover:text-slate-900 focus-visible:ring-3 aria-selected:border-slate-900 aria-selected:font-semibold aria-selected:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 dark:aria-selected:border-slate-100 dark:aria-selected:text-slate-100"
          >
            {item.label}
            {item.badge != null ? (
              <span className="text-xs font-medium text-slate-400 tabular-nums dark:text-slate-500">
                {item.badge}
              </span>
            ) : null}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export { CompactTabs };
export type { CompactTabsItem, CompactTabsProps };
