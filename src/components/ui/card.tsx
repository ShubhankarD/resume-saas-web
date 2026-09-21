import * as React from "react";
import { cn } from "cn";

type CardSize = "default" | "sm" | "lg";

function Card({
  className,
  size = "default",
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Controls the card's internal padding rhythm via `--card-spacing`.
   * - `sm`: 12px / 16px (compact list rows)
   * - `default`: 16px / 20px (`p-4 sm:p-5`)
   * - `lg`: 20px / 24px (`p-5 sm:p-6`, summary + metric cards)
   */
  size?: CardSize;
  /**
   * Opt-in hover elevation for cards that are genuinely clickable
   * (stronger border + very subtle shadow). Plain cards stay flat.
   */
  interactive?: boolean;
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-interactive={interactive ? "true" : undefined}
      className={cn(
        // A resting shadow this light is not decoration (§24): with a white
        // card on a light canvas the border alone carried the whole edge, so
        // a 1-2px ambient shadow is what separates the surface from the page.
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-lg border border-slate-200 bg-white py-(--card-spacing) text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_1px_3px_-1px_rgba(15,23,42,0.07)] transition-[border-color,box-shadow] duration-150 ease-out",
        "[--card-spacing:--spacing(4)] data-[size=lg]:[--card-spacing:--spacing(5)] data-[size=sm]:[--card-spacing:--spacing(3)]",
        "sm:[--card-spacing:--spacing(5)] sm:data-[size=lg]:[--card-spacing:--spacing(6)] sm:data-[size=sm]:[--card-spacing:--spacing(4)]",
        "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0",
        "data-[interactive=true]:hover:border-slate-300 data-[interactive=true]:hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_4px_10px_-2px_rgba(15,23,42,0.10)]",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)] dark:data-[interactive=true]:hover:border-slate-700 dark:data-[interactive=true]:hover:shadow-[0_4px_10px_-2px_rgba(0,0,0,0.55)]",
        "*:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-sm leading-snug font-semibold tracking-tight text-slate-900 group-data-[size=sm]/card:text-sm sm:text-base group-data-[size=lg]/card:sm:text-lg dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-6 text-slate-600 dark:text-slate-400", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 rounded-b-lg border-t border-slate-200 bg-slate-50/60 p-(--card-spacing) dark:border-slate-800 dark:bg-slate-950/40",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
