"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";

/**
 * Groups accordion items. Thin wrapper over Base UI's Accordion.Root.
 *
 * Base UI drives `aria-expanded` / `aria-controls` on the trigger and
 * `role="region"` on the panel, so expanded state is exposed to assistive
 * technology without any extra wiring here.
 */
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root data-slot="accordion" className={cn("w-full", className)} {...props} />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "border-b border-slate-200/80 last:border-b-0 dark:border-slate-800",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger focus-visible:ring-ring/50 flex min-h-10 flex-1 items-center justify-between gap-4 rounded-lg py-4 text-left text-sm font-semibold tracking-tight text-slate-900 transition-colors duration-150 outline-none select-none hover:text-slate-700 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-100 dark:hover:text-slate-300",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[panel-open]/accordion-trigger:rotate-180 dark:text-slate-500"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm leading-relaxed text-slate-600 transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 dark:text-slate-400",
      )}
      {...props}
    >
      <div className={cn("pt-1 pb-5", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
