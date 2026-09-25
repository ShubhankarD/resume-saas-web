"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "cn";

/**
 * A side drawer built on Base UI's Dialog. Modal by default, so focus is
 * trapped inside the panel, page scroll is locked, and Escape / outside
 * press close it.
 */
function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-slate-950/25 duration-200 supports-backdrop-filter:backdrop-blur-xs dark:bg-slate-950/60",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  closeLabel = "Close",
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "left" | "right";
  closeLabel?: string;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "data-open:animate-in data-closed:animate-out fixed inset-y-0 z-50 flex h-full w-full max-w-sm flex-col gap-5 overflow-y-auto border-slate-200 bg-white p-4 shadow-xl duration-200 outline-none sm:p-5 dark:border-slate-800 dark:bg-slate-900",
          side === "right"
            ? "data-open:slide-in-from-right data-closed:slide-out-to-right right-0 border-l"
            : "data-open:slide-in-from-left data-closed:slide-out-to-left left-0 border-r",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          data-slot="sheet-close-button"
          aria-label={closeLabel}
          className="focus-visible:ring-ring/50 absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-3 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X aria-hidden="true" className="size-4" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 pr-11", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-sm font-semibold tracking-[-0.01em] text-slate-900 sm:text-base dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm leading-6 text-slate-600 dark:text-slate-400", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
