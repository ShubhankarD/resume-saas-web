import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-150 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // The filled, primary-weight actions get the full treatment: a 1px
        // lift, a small elevation shadow, and a subtle zoom. The base
        // `active:scale-[0.98]` still wins on press, so hover raises and
        // click depresses.
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 aria-expanded:bg-primary/90 hover:-translate-y-px hover:scale-[1.02] active:translate-y-0 hover:shadow-[0_3px_8px_-2px_rgba(15,23,42,0.35)] dark:hover:shadow-[0_3px_8px_-2px_rgba(0,0,0,0.6)]",
        cta: "bg-amber-500 text-slate-950 hover:bg-amber-400 active:bg-amber-500 focus-visible:ring-amber-500/40 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 hover:-translate-y-px hover:scale-[1.02] active:translate-y-0 hover:shadow-[0_3px_10px_-2px_rgba(245,158,11,0.55)]",
        outline:
          "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 aria-expanded:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:active:bg-slate-800 dark:aria-expanded:bg-slate-800 hover:-translate-y-px active:translate-y-0 hover:shadow-[0_2px_6px_-2px_rgba(15,23,42,0.18)] dark:hover:shadow-[0_2px_6px_-2px_rgba(0,0,0,0.5)]",
        secondary:
          "bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-100 aria-expanded:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/70 dark:active:bg-blue-950/70 dark:aria-expanded:bg-blue-950/70 hover:-translate-y-px active:translate-y-0 hover:shadow-[0_2px_6px_-2px_rgba(37,99,235,0.28)]",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70 aria-expanded:bg-slate-100 aria-expanded:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:active:bg-slate-700/70 dark:aria-expanded:bg-slate-800 dark:aria-expanded:text-slate-100",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-700 focus-visible:border-red-500 focus-visible:ring-red-500/30 dark:bg-red-600 dark:text-white dark:hover:bg-red-500 hover:-translate-y-px hover:scale-[1.02] active:translate-y-0 hover:shadow-[0_3px_8px_-2px_rgba(220,38,38,0.45)]",
        link: "text-primary underline-offset-4 hover:underline active:not-aria-[haspopup]:scale-100",
      },
      size: {
        default:
          "h-10 gap-1.5 rounded-lg px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-md px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-md px-3 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 rounded-lg px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10 rounded-lg",
        "icon-xs":
          "size-7 rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
