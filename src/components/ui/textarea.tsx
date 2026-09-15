import * as React from "react";
import { cn } from "cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 transition-[color,background-color,border-color,box-shadow] duration-150 ease-out outline-none",
        "placeholder:text-slate-400",
        "hover:border-slate-300",
        "focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        "dark:hover:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-white/10 dark:disabled:bg-slate-900/80",
        "dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
